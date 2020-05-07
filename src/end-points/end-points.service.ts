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

    let projectName = (query.projectName || this.config.get('projectName')).toLowerCase();
    let strippedUri = uri.replace('/intercept/', '/');
  
    const initialResponse = {
      path: strippedUri,
      id: uniqid(),
      serviceName: 'default',
      match: {}, //used to matched body data and return the 666 response.
      statusCode: '500',
      delay: 0,
      emptyArray: false,
      customHeaders: {},
      forward: false,
      response: {
        200: [],
        401: [],
        404: [],
        500: { message: "Please update mocks data" },
        666: { message: "Handle with care"}
      }
    }

    let found = await this.projectModel.findOne({name: projectName, 'endpoints.path': strippedUri });

    if (found) {
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
                    response: {
                      $mergeObjects: ['$endpoint.response', {
                        200: {
                          $slice: ['$endpoint.response.200', parseInt(query.from, 10) || 0, parseInt(query.size, 10) || 10]
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

      const data = project[0].endpoint.response;

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
      const endpoint = await this.projectModel.updateOne(
        { name: projectName },
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
  }
}