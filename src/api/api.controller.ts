import { Controller, Get, Param, Post, Body, UseInterceptors, UploadedFiles, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiService } from './api.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from './DTO/create-project-dto';

@ApiTags('Projects')
@Controller('api/projects')
export class ApiController {

  constructor(private apiService: ApiService) { }

  @Post()
  async createProject(@Body() data: CreateProjectDto) {
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

  @Delete('/:projectName/services/:serviceName')
  async deleteServices(@Param('projectName') projectName: string, @Param('serviceName') serviceName: string){
    return this.apiService.deleteServices(projectName, serviceName);
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

  @Get('/export/:projectName')  
  async exportProject(@Param('projectName') projectName: string) {
    return this.apiService.exportProject(projectName);
  }

  @Post('/import/:projectName')
  @UseInterceptors(FilesInterceptor('files[]'))
  async importProject(@Param('projectName') projectName: string, @UploadedFiles() files) {
    return this.apiService.importProject(projectName, files);
  }

}
