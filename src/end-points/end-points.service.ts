import { Injectable, Inject, HttpService } from '@nestjs/common';
import { Model } from 'mongoose';
import { Endpoint } from '../interfaces/endpoints.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../interfaces/project.interface';

const sleep = require('sleep-promise');
let uniqid = require('uniqid');

@Injectable()
export class EndPointsService {

  constructor(
    @InjectModel('Endpoint') private readonly endPointModel: Model<Endpoint>, 
    @InjectModel('Project') private readonly projectModel: Model<Project>, 
    private readonly httpService: HttpService) {

  }

  forwardRequest() {
    // this.httpService.get('https://api.myjson.com/bins/1dxlii').subscribe(val => {
    //   console.log('val', val);
    // });
  }

  async interceptEnpoints(uri, query) {

    const initialResponse = {
      path: uri,
      id: uniqid(),
      serviceName: uri.split('/')[4],
      statusCode: '500',
      delay: 0,
      emptyArray: false,
      customHeaders: {},
      response: {
        200: [],
        401: [],
        404: [],
        500: { message: "Please update mocks data" }
      }
    }

    let found = await this.projectModel.findOne({name: uri.split('/')[2], 'endpoints.path': uri });

    if (found) {
      let project = await this.projectModel.aggregate([{
          $match: {
            name: uri.split('/')[2],
            'endpoints.path': uri
          }
        },
        {
          $project: {
            endpoints: {
              $filter: {
                input: '$endpoints',
                as: 'endpoint',
                cond: {
                  $eq: ["$$endpoint.path", uri]
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
                    serviceName: '$endpoint.serviceName',
                    delay: '$endpoint.delay',
                    statusCode: '$endpoint.statusCode',
                    response: {
                      $mergeObjects: ['$endpoint.response', {
                        200: {
                          $slice: ['$endpoint.response.200', 2]
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

      if (parseInt(data.delay, 10) > 0) await sleep(data.delay);
      return data

    } else {
      const endpoint = await this.projectModel.updateOne(
        {name: uri.split('/')[2]},
        {$addToSet:{
          endpoints: initialResponse
        }});
      return initialResponse;
    }   
  }
}