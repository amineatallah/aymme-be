import { Injectable, HttpService, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../interfaces/project.interface';
import { AuthService } from 'src/helpers/authService';

@Injectable()
export class ApiService {
  constructor(
    @InjectModel('Project') private readonly projectModel: Model<Project>,
    private readonly authService: AuthService,
    private readonly httpService: HttpService
  ) {}

  async syncEndpointWithRemote(projectName, path) {
    const project = await this.projectModel.findOne({name: projectName});

    const config = {
      username: project.config.username,
      password: project.config.password,
      url : project.config.identityLoginUrl,
      projectName: projectName
    }

    const Token = this.authService.getToken(project.name) || await this.authService.identityLogin(config).catch(error => {
      throw new HttpException(error.response.data.error_description || error.response.data.error, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const data = await this.syncEndpointData(project, path).catch(error => {
      this.authService.resetToken(project.name);
      console.log('error', error);
      if(error.response.status === 404) {
        throw new HttpException(error.response.statusText || '' , HttpStatus.NOT_FOUND);
      } else {

        throw new HttpException(error.response.statusText || 'Something went wrong' , HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    return data;
  }

  async syncEndpointData(project, path) {
    let regex = new RegExp(project.config.regex);
    let uri = path.replace(regex, '');
    console.log('uri*********', uri);
    const result = await this.httpService.get(`${project.config.host}${uri}`, { headers: { Cookie: "Authorization=" + this.authService.getToken(project.name) } }).toPromise();
    return result.data;
  }

  async updateProjectConfig(projectName, body) {
    return await this.projectModel.updateOne({
      name: projectName.toLowerCase()
    },{ config: body})
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
    }, {
      $group: {
        _id: "$endpoints.serviceName",
        serviceName: {
          $first: '$endpoints.serviceName'
        },
        endpoints: {
          $push: {
            path: '$endpoints.path',
            id: "$endpoints.id",
            statusCode: "$endpoints.statusCode",
            method: "$endpoints.method"
          }
        }
      }
    }, {
      $sort: {
        "serviceName": 1
      }
    }
    ]);

    const config = await this.projectModel.aggregate([{
      $match: {
        name: projectName
      }
      },{
        $project: {
          config: 1,
        }
      }
    ])

    return {...config[0], services: project};
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
        "endpoints.$.match": data.match,
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
