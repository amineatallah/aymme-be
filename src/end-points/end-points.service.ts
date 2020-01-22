import { Injectable, Inject, HttpService } from '@nestjs/common';
import { Model } from 'mongoose';
import { Endpoint } from '../interfaces/endpoints.interfaces';
import { InjectModel } from '@nestjs/mongoose';
const sleep = require('sleep-promise');

@Injectable()
export class EndPointsService {

  constructor(@InjectModel('Endpoint') private readonly endPointModel: Model<Endpoint>, private readonly httpService: HttpService) {

  }

  forwardRequest() {
    // this.httpService.get('https://api.myjson.com/bins/1dxlii').subscribe(val => {
    //   console.log('val', val);
    // });
  }

  async interceptEnpoints(uri, query) {


    let endpoint;
    let found = await this.endPointModel.findOne({ path: uri });

    if (found) {
      if (found.response[200].data.body.length) {

        endpoint = await this.endPointModel.aggregate(
          [
            { $match: { path: uri } },
            { $unwind: { path: '$response.200.data.body' } },
            { $limit: parseInt(query.size) || 20 },
            { $group: { _id: '$_id', 'response': { $push: '$response.200.data.body' } } },
          ]
        );

        found.response[200].data.body = endpoint[0].response;
      }

      if (found.emptyArray) {
        found.response[200].data.body = [];
      }

      if (parseInt(found.delay, 10) > 0) await sleep(found.delay);
      return found;

    } else {
      const endpoint = this.endPointModel({
        path: uri,
        serviceName: uri.split('/')[3],
        response: {
          200: {
            data: {
              body: []
            }
          },
          401: {
            data: {
              body: []
            },
          },
          404: {
            data: {
              body: []
            }
          },
          500: {
            data: {
              body: {message: "Please update mocks data"}
            }
          }
        }
      });
      return await endpoint.save();
    }
  }
}