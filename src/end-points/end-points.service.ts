import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../interfaces/project.interface';

const sleep = require('sleep-promise');
let uniqid = require('uniqid');

@Injectable()
export class EndPointsService {

  constructor(
    @InjectModel('Project') private readonly projectModel: Model<Project>,
    private readonly config: ConfigService) {
  }

  async interceptEnpoints(uri, query, body) {
    let queryParams = '';

    let projectName = (query.projectName || this.config.get('projectName')).toLowerCase();
    let project = await this.projectModel.findOne({name: projectName}) ;

    let strippedUri = uri.replace('/intercept/', '/');


    for (const prop in query) {
      if (query.hasOwnProperty(prop)) {
        if(project.config.whitelist_params.includes(prop)){
          queryParams += prop + '=' + query[prop] + '&'
        }
      } 
    }

    if(queryParams !== '') {
      strippedUri += '?' + queryParams;
    }
    strippedUri = strippedUri.replace(/&$/, '');

    let endpointFound = await this.projectModel.findOne({name: projectName, 'endpoints.path': strippedUri });

    if (endpointFound) {
  
      let endpoints = await this.getEndpoint(query, projectName, strippedUri);
      let data = endpoints[0].endpoint.response;
      if (data.emptyArray) {
        data.response[200] = [];
      }

      if(data['match'] && data['match']['name'] in body && data['match']['value'] === body[data['match']['name']]){
        data['statusCode'] = 200;
        data.response[200] = data.response[666];
      }

      if(data['match'] && data['match']['name'] in body && data['match']['value'] !== body[data['match']['name']]){
        data['statusCode'] = 401;
      }

      if (parseInt(data.delay, 10) > 0) await sleep(data.delay);
      return data

    } else {

      return await this.createEndpoint(project, strippedUri);

    }   
  }

  async createEndpoint(project, strippedUri) {
    let initialResponse = {
      path: strippedUri,
      id: uniqid(),
      serviceName: 'default',
      match: {}, //used to matche body data and return the 666 response.
      statusCode: '500',
      delay: 0,
      emptyArray: false,
      customHeaders: {},
      forward: false,
      response: {
        200: { message: "Please update mocks data" },
        401: [],
        404: [],
        500: { message: "Please update mocks data" },
        666: { message: "Handle with care"}
      }
    }

    let pathArray = initialResponse.path.split('/');

    if(pathArray.indexOf('client-api') > 0) {
      initialResponse.serviceName = pathArray[pathArray.indexOf('client-api') - 1];
    }

    await this.projectModel.updateOne(
      { name: project.name },
      {
        $push: {
          endpoints: {
            $each: [initialResponse],
            $sort: {
              path: 1
            }
          }
      }});

    return initialResponse;
  }

  async getEndpoint( query, projectName, strippedUri) {
      let project = await this.projectModel.aggregate([{
        $match: {
          name: projectName,
          'endpoints.path': strippedUri
        }
      },
      {
        $project: {
          endpoints: {
            $filter: {
              input: '$endpoints',
              as: 'endpoint',
              cond: {
                $eq: ["$$endpoint.path", strippedUri]
              }
            }
          }
        }
      },
      {
        $project: {
          endpoint: {
            $arrayElemAt: ['$endpoints', 0]
          }
        }
      }, {
        $project: {
          endpoint: {
            $cond: {
              if: {
                $isArray: '$endpoint.response.200'
              },
              then: {
                response: {
                  path: '$endpoint.path',
                  match: '$endpoint.match',
                  serviceName: '$endpoint.serviceName',
                  delay: '$endpoint.delay',
                  statusCode: '$endpoint.statusCode',
                  customHeaders: '$endpoint.customHeaders',
                  emptyArray: '$endpoint.emptyArray',
                  response: {
                    $mergeObjects: ['$endpoint.response', {
                      200: {
                        $slice: ['$endpoint.response.200', query.from * 10 || 0, parseInt(query.size, 10) || 10]
                      }
                    }]
                  }
                }
              },
              else: {
                response: '$endpoint'
              }
            }
          }
        }
      }
    ]);

    return project;
  }
}