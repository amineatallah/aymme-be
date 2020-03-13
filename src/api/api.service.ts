import { Injectable, HttpService, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../interfaces/project.interface';

@Injectable()
export class ApiService {
  constructor(
    @InjectModel('Project') private readonly projectModel: Model<Project>,
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
        "endpoints.$.serviceName": data.serviceName,
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
