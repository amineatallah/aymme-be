import { Injectable, HttpService } from '@nestjs/common';
import { Model } from 'mongoose';
import { Endpoint } from '../interfaces/endpoints.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Mock } from '../interfaces/mock.interface';
import * as _ from 'lodash';
import { PortalModel } from '../interfaces/portalModel.interface';
import { cleanModel } from '../helpers/helpers';

@Injectable()
export class ApiService {
  constructor(
    @InjectModel('Endpoint') private readonly endPointModel: Model<Endpoint>,
    @InjectModel('Mock') private readonly mockModel: Model<Mock>,
    @InjectModel('PortalModel') private readonly portalModel: Model<PortalModel>,
    private readonly httpService: HttpService
  ) {

  }
  async getServices() {
    const services = await this.endPointModel.aggregate([
      { $group: { _id: "$serviceName", serviceName: { $first: '$serviceName' }, endpoints: { $push: { path: '$path', id: "$_id", statusCode: "$statusCode" } } } },
      { $sort: { serviceName: 1 } }
    ]);
    return services;
  }

  async getServiceEndpoints(serviceName) {
    const endpoints = await this.endPointModel.find({ 'serviceName': serviceName });
    return endpoints;
  }

  async getEndpoints() {
    const endpoints = await this.endPointModel.find();
    return endpoints;
  }

  async getEndpoint(id) {
    let endpoint = await this.endPointModel.findById(id);
    return endpoint;
  }

  async deleteEndpointById(id: string) {
    let deleted = await this.endPointModel.deleteOne({ _id: id });
    return deleted;
  }

  async updateEndpoint(id, data) {

    let statusCode = data.statusCode;
    let endPoint = await this.getEndpoint(id);
    endPoint.statusCode = statusCode;
    endPoint.response[statusCode].data.body = data.response;
    endPoint.delay = data.delay;
    endPoint.emptyArray = data.emptyArray;
    endPoint.forward = data.forward;
    endPoint.customHeaders = data.customHeaders;
    endPoint.markModified('customHeaders');
    endPoint.markModified('response');
    endPoint = await endPoint.save();

    return endPoint;

  }

  async deleteServices(name) {
    let deleted = await this.endPointModel.deleteMany({ serviceName: name })
    return deleted;
  }

  async findMocks(id) {
    let endpoint = await this.endPointModel.aggregate([{ $match: { 'response.200.data.body.id': id } }, { $unwind: { path: '$response.200.data.body' } }, { $match: { 'response.200.data.body.id': id } }, { $project: { 'response': '$response.200.data.body', _id: 0 } }])
    return endpoint;
  }

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

    if (jsonData.pages.length > 0 ) {
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
    }, {upsert: true, new: true});
    return {
      name: model.name,
      host: model.host,
      loginUrl: loginUrl,
      pages: model.pages,
      activePage: model.activePage
    }
  }

  async updatePortalModel(portalName, data) {
    let model = await this.portalModel.findOneAndUpdate({ name: portalName }, data, {new: true});
    return model;
  }

}
