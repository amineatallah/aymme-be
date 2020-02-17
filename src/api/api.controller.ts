import { Controller, Get, Param, Post, Body, UseInterceptors, UploadedFiles, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {

  constructor(private apiService: ApiService) { }

  // endpoints
  @Get('/endpoints/:id')
  async getEndpoint(@Param('id') id: string) {
    return this.apiService.getEndpoint(id);
  }

  @Post('/endpoints/:id')
  async updateEndpoint(@Param('id') id, @Body() data) {
    return this.apiService.updateEndpoint(id, data);
  }

  @Delete('/endpoints/:id')
  async deleteEnpointById(@Param('id') id) {
    return this.apiService.deleteEndpointById(id);
  }

  // @Get('/endpoints')
  // async getEndpoints() {
  //   return this.apiService.getEndpoints();
  // }

  // services
  @Get('/services/:service')
  async getService(@Param('service') service) {
    return this.apiService.getServiceEndpoints(service);
  }

  @Get('/services')
  async getServices() {
    return this.apiService.getServices();
  }

  @Delete('/services/:service')
  async deleteServices(@Param('service') service) {
    return this.apiService.deleteServices(service);
  }

  @Post('/createspec')
  async createSpec(@Body('name') name) {
    return this.apiService.createSpec(name);
  }

  @Get('/specs')
  async getSpecs() {
    return this.apiService.getSpecs();
  }

  @Delete('/specs/:id')
  async deleteSpecs(@Param('id') id) {
    return this.apiService.deleteSpecs(id);
  }

  @Post('/upload/:id')
  @UseInterceptors(FilesInterceptor('files[]'))
  async uploadFile(@UploadedFiles() files, @Param('id') id) {
    return this.apiService.uploadFile(id, files);
  }

  @Get('/findmocks/:id')
  async findMocks(@Param('id') id) {
    return this.apiService.findMocks(id);
  }


  // portal models
  @Get('/getportals')
  async getPortals() {
    console.log('here');
    return this.apiService.getPortals();
  }

  @Delete('/portal/:name')
  async deletePortal(@Param('name') name) {
    return this.apiService.deletePortal(name);
  }

  // @Get('/getmodel/:portalName')
  // async getModel(@Param('portalName') portalName){
  //   console.log('portal', portalName)
  //   return this.apiService.getModel(portalName);
  // }

  @Get('simplemodel/:portalName')
  async getSimpleModel(@Param('portalName') portalName) {
    return this.apiService.getSimpleModel(portalName);
  }

  @Post('/syncmodel')
  async syncPortalModel(@Body('portalName') portalName, @Body('portalUrl') portalUrl, @Body('loginUrl') loginUrl) {
    return this.apiService.syncPortalModel(portalName, portalUrl, loginUrl);
  }

  @Post('/updatemodel/:portalName')
  async updatePortalModel(@Param('portalName') portalName, @Body() body) {
    return this.apiService.updatePortalModel(portalName, body);
  }
}
