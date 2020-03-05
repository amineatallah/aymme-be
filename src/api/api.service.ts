import { Injectable, HttpService, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { Endpoint } from '../interfaces/endpoints.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Mock } from '../interfaces/mock.interface';
import * as _ from 'lodash';
import { PortalModel } from '../interfaces/portalModel.interface';
import { cleanModel } from '../helpers/helpers';
import { Project } from '../interfaces/project.interface';

@Injectable()
export class ApiService {
  constructor(
    @InjectModel('Endpoint') private readonly endPointModel: Model<Endpoint>,
    @InjectModel('Mock') private readonly mockModel: Model<Mock>,
    @InjectModel('Project') private readonly projectModel: Model<Project>,
    @InjectModel('PortalModel') private readonly portalModel: Model<PortalModel>,
    private readonly httpService: HttpService
  ) {

  }

  async createProject(projectName) {
    let project = await this.projectModel.create({ name: projectName.toLowerCase() });
    return project;
  }

  async deleteProject(projectName: string) {
    let deleted = await this.projectModel.deleteOne({ name: projectName });
    return deleted;
  }

  async getProjects() {
    const projects = await this.projectModel.find();
    return projects;
  }

  async getServices(projectName: string) {
    const project = await this.projectModel.aggregate([{
      $match: {
        name: projectName
      }
    }, {
      $project: {
        endpoints: 1
      }
    }, {
      $unwind: "$endpoints"
    },
    {
      $group: {
        _id: "$endpoints.serviceName",
        serviceName: {
          $first: '$endpoints.serviceName'
        },
        endpoints: {
          $push: {
            path: '$endpoints.path',
            id: "$endpoints.id",
            statusCode: "$endpoints.statusCode"
          }
        }
      }
    },
    {
      $sort: {
        "serviceName": 1
      }
    }
    ]);
    return project;
  }

  async exportProject(projectName) {
    const services = await this.projectModel.find({ 'name': projectName });
    return services;
  }

  async getServiceEndpoints(serviceName) {
    const endpoints = await this.endPointModel.find({ 'serviceName': serviceName });
    return endpoints;
  }

  async getEndpoints() {
    console.log('getEndpoints');
    const endpoints = await this.endPointModel.find();
    return endpoints;
  }

  async getEndpoint(projectName, id) {
    let project = await this.projectModel.find({ name: projectName }, { endpoints: { $elemMatch: { id: id } } });
    return project[0].endpoints[0];
  }

  async deleteEndpointById(projectName: string, id: string) {
    let deleted = await this.projectModel.updateOne({
      name: projectName
    }, {
      $pull: {
        endpoints: { id: id }
      }
    })

    return deleted;
  }

  async updateEndpoint(projectName, id, data) {

    let endpoint = await this.projectModel.updateOne({
      name: projectName,
      endpoints: { $elemMatch: { id: id } }
    }, {
      $set: {
        "endpoints.$.statusCode": data.statusCode,
        "endpoints.$.delay": data.delay,
        "endpoints.$.response": data.response,
        "endpoints.$.emptyArray": data.emptyArray,
        "endpoints.$.forward": data.forward,
        "endpoints.$.customHeaders": data.customHeaders
      }
    })

    return endpoint;

  }

  async deleteServices(projectName: string, serviceName: string) {
    let deleted = await this.projectModel.updateOne({
      name: projectName
    }, {
      $pull: {
        endpoints: { serviceName: serviceName }
      }
    })

    return deleted;
  }

  // async findMocks(id) {
  //   let endpoint = await this.endPointModel.aggregate([{ $match: { 'response.200.data.body.id': id } }, { $unwind: { path: '$response.200.data.body' } }, { $match: { 'response.200.data.body.id': id } }, { $project: { 'response': '$response.200.data.body', _id: 0 } }])
  //   return endpoint;
  // }

  async createSpec(name) {
    return await this.mockModel.insertMany([{ name }]);
  }

  async getSpecs() {
    const specs = await this.mockModel.find().sort({ name: 1 });
    return specs;
  }

  async getSpec(id) {
    let spec = await this.mockModel.findById(id);
    return spec;
  }

  async deleteSpecs(id) {
    let deleted = await this.mockModel.deleteOne({ _id: id });
    return deleted;
  }

  async uploadFile(id, files) {

    let spec = await this.getSpec(id);

    let formatedFiles = files.map(file => {
      return {
        name: file.originalname,
        data: JSON.parse(file.buffer)
      }
    });
    let uniqueFiles = _.unionBy(formatedFiles, spec.exmpales, 'name');
    spec.exmpales = uniqueFiles;

    return await spec.save();
  }

  async getPortals() {
    let portals = await this.portalModel.find();
    portals = portals.map(portal => {
      return {
        name: portal.name,
        host: portal.host,
        loginUrl: portal.loginUrl,
        activePage: portal.activePage,
        pages: portal.pages
      }
    })
    return portals;
  }

  async deletePortal(name) {
    let deleted = await this.portalModel.deleteOne({ name: name });
    return deleted;
  }

  // async getModel(portalName) {
  //   let portalModel = await this.portalModel.findOne({ name: portalName });
  //   return {
  //     name: portalModel.name,
  //     host: portalModel.host,
  //     activePage: portalModel.activePage,
  //     loginUrl: portalModel.loginUrl,
  //     pages: JSON.parse(portalModel.pages)
  //   };
  // }

  async getSimpleModel(portalName) {
    let portalModel = await this.portalModel.findOne({ name: portalName });
    let pages = portalModel.pages;
    let page = pages.find(page => page.name === portalModel.activePage);
    return page;
  }

  async syncPortalModel(portalName, portalUrl, loginUrl) {
    const login = await this.httpService.post(loginUrl, { username: 'admin', password: 'admin' }).toPromise();
    const result = await this.httpService.get(portalUrl + '/' + portalName + '.json', { headers: { Cookie: "Authorization=" + login.data.access_token } }).toPromise();
    let data = JSON.stringify(result.data).replace(/preferences/g, 'properties');

    let jsonData = JSON.parse(data);

    let newActivePage = null;

    if (jsonData.pages.length > 0) {
      let indexPage = jsonData.pages.find((page) => page.name === 'index');

      if (indexPage) {
        newActivePage = indexPage.name;
      }
      else {
        newActivePage = jsonData.pages[0].name;
      }
    }

    let model = await this.portalModel.findOneAndUpdate({ name: portalName }, {
      name: jsonData.name,
      host: portalUrl,
      loginUrl: loginUrl,
      pages: cleanModel(jsonData.pages),
      activePage: newActivePage
    }, { upsert: true, new: true });

    return {
      name: model.name,
      host: model.host,
      loginUrl: loginUrl,
      pages: model.pages,
      activePage: model.activePage
    }
  }

  async updatePortalModel(portalName, data) {
    let model = await this.portalModel.findOneAndUpdate({ name: portalName }, data, { new: true });
    return model;
  }

  async importProject(projectName, files) {
    let parsedFile = files.map(file => {
      return {
        name: file.originalname,
        data: JSON.parse(file.buffer)
      }
    })[0];

    if (projectName !== parsedFile.data[0].name) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: "The project name does not match." }, 400);
    }

    await this.projectModel.updateOne(
      {
        name: projectName,
        $set: { endpoints: parsedFile.data[0].endpoints },
      }
    );

    return this.getServices(projectName);
  }
}
