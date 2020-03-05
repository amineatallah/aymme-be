import { Controller, Get, Param, Post, Body, UseInterceptors, UploadedFiles, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiService } from './api.service';

@Controller('api/projects')
export class ApiController {

  constructor(private apiService: ApiService) { }

  @Post()
  async createProject(@Body() data: {projectName: string}) {
    return this.apiService.createProject(data.projectName).catch(error => {
      throw new HttpException(error.errmsg || error.errors.name.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  @Get()
  async getProjects() {
    return this.apiService.getProjects();
  }

  @Delete('/:projectName')
  async deleteProject(@Param('projectName') projectName: string){
    return this.apiService.deleteProject(projectName);
  }

  @Get('/:projectName/services')
  async getProject(@Param('projectName') projectName: string){
    return this.apiService.getServices(projectName);
  }

  @Get('/:projectName/endpoints/:id')
  async getEndpoint(@Param('projectName') projectName: string, @Param('id') id:string){
    return this.apiService.getEndpoint(projectName, id);
  }

  @Post('/:projectName/endpoints/:id')
  async updateEndpoint(@Param('projectName') projectName: string, @Param('id') id: string, @Body() data) {
    return this.apiService.updateEndpoint(projectName, id, data);
  }

  @Delete('/:projectName/endpoints/:id')
  async deleteEndpointById(@Param('projectName') projectName: string, @Param('id') id: string){
    return this.apiService.deleteEndpointById(projectName, id);
  }

  @Delete('/:projectName/services/:serviceName')
  async deleteServices(@Param('projectName') projectName: string, @Param('serviceName') serviceName: string){
    return this.apiService.deleteServices(projectName, serviceName);
  }

  @Get('/export/:projectName')  
  async exportProject(@Param('projectName') projectName: string) {
    return this.apiService.exportProject(projectName);
  }

  @Post('/import/:projectName')
  @UseInterceptors(FilesInterceptor('files[]'))
  async importProject(@Param('projectName') projectName: string, @UploadedFiles() files) {
    return this.apiService.importProject(projectName, files);
  }

  // portal models
  // @Get('/getportals')
  // async getPortals() {
  //   return this.apiService.getPortals();
  // }

  // @Delete('/portal/:name')
  // async deletePortal(@Param('name') name: string) {
  //   return this.apiService.deletePortal(name);
  // }

  // // @Get('/getmodel/:portalName')
  // // async getModel(@Param('portalName') portalName){
  // //   console.log('portal', portalName)
  // //   return this.apiService.getModel(portalName);
  // // }

  // @Get('simplemodel/:portalName')
  // async getSimpleModel(@Param('portalName') portalName: string) {
  //   return this.apiService.getSimpleModel(portalName);
  // }

  // @Post('/syncmodel')
  // async syncPortalModel(@Body('portalName') portalName: string, @Body('portalUrl') portalUrl: string, @Body('loginUrl') loginUrl: string) {
  //   return this.apiService.syncPortalModel(portalName, portalUrl, loginUrl);
  // }

  // @Post('/updatemodel/:portalName')
  // async updatePortalModel(@Param('portalName') portalName: string, @Body() body) {
  //   return this.apiService.updatePortalModel(portalName, body);
  // }



}
