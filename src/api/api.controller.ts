import { Controller, Get, Param, Post, Body, UseInterceptors, UploadedFiles, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {

  constructor(private apiService: ApiService) { }

  @Post('projects')
  async createProject(@Body() data: {projectName: string}) {
    return this.apiService.createProject(data.projectName).catch(error => {
      throw new HttpException(error.errmsg || error.errors.name.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  @Get('/projects')
  async getProjects() {
    return this.apiService.getProjects();
  }

  @Delete('/projects/:projectName')
  async deleteProject(@Param('projectName') projectName: string){
    return this.apiService.deleteProject(projectName);
  }

  @Get('/projects/:projectName/services')
  async getProject(@Param('projectName') projectName: string){
    return this.apiService.getServices(projectName);
  }

  @Get('/projects/:projectName/endpoints/:id')
  async getEndpoint(@Param('projectName') projectName: string, @Param('id') id:string){
    return this.apiService.getEndpoint(projectName, id);
  }

  @Post('/projects/:projectName/endpoints/:id')
  async updateEndpoint(@Param('projectName') projectName: string, @Param('id') id: string, @Body() data) {
    return this.apiService.updateEndpoint(projectName, id, data);
  }

  @Delete('/projects/:projectName/endpoints/:id')
  async deleteEndpointById(@Param('projectName') projectName: string, @Param('id') id: string){
    return this.apiService.deleteEndpointById(projectName, id);
  }

  @Delete('/projects/:projectName/services/:serviceName')
  async deleteServices(@Param('projectName') projectName: string, @Param('serviceName') serviceName: string){
    return this.apiService.deleteServices(projectName, serviceName);
  }

  @Post('/createspec')
  async createSpec(@Body('name') name: string) {
    return this.apiService.createSpec(name);
  }

  @Get('/specs')
  async getSpecs() {
    return this.apiService.getSpecs();
  }

  @Delete('/specs/:id')
  async deleteSpecs(@Param('id') id: string) {
    return this.apiService.deleteSpecs(id);
  }

  @Post('/upload/:id')
  @UseInterceptors(FilesInterceptor('files[]'))
  async uploadFile(@UploadedFiles() files, @Param('id') id) {
    return this.apiService.uploadFile(id, files);
  }

  // @Get('/findmocks/:id')
  // async findMocks(@Param('id') id: string) {
  //   return this.apiService.findMocks(id);
  // }


  // portal models
  @Get('/getportals')
  async getPortals() {
    return this.apiService.getPortals();
  }

  @Delete('/portal/:name')
  async deletePortal(@Param('name') name: string) {
    return this.apiService.deletePortal(name);
  }

  // @Get('/getmodel/:portalName')
  // async getModel(@Param('portalName') portalName){
  //   console.log('portal', portalName)
  //   return this.apiService.getModel(portalName);
  // }

  @Get('simplemodel/:portalName')
  async getSimpleModel(@Param('portalName') portalName: string) {
    return this.apiService.getSimpleModel(portalName);
  }

  @Post('/syncmodel')
  async syncPortalModel(@Body('portalName') portalName: string, @Body('portalUrl') portalUrl: string, @Body('loginUrl') loginUrl: string) {
    return this.apiService.syncPortalModel(portalName, portalUrl, loginUrl);
  }

  @Post('/updatemodel/:portalName')
  async updatePortalModel(@Param('portalName') portalName: string, @Body() body) {
    return this.apiService.updatePortalModel(portalName, body);
  }

  @Get('/exportproject/:projectName')  
  async exportProject(@Param('projectName') projectName: string) {
    return this.apiService.exportProject(projectName);
  }

  @Post('/importproject/:projectName')
  @UseInterceptors(FilesInterceptor('files[]'))
  async importProject(@Param('projectName') projectName: string, @UploadedFiles() files) {
    return this.apiService.importProject(projectName, files);
  }

}
