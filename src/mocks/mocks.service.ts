import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { Mock } from '../interfaces/mock.interface';

@Injectable()
export class MocksService {
  constructor(
      @InjectModel('Mock') private readonly mockModel: Model<Mock>,
    ) {}

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
  
}
