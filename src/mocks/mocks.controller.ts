import { Controller, Post, Body, Get, Delete, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { MocksService } from './mocks.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Specs')
@Controller('api/specs')
export class MocksController {

    constructor(private mocksService: MocksService) { }

    @Post()
    async createSpec(@Body('name') name: string) {
      return this.mocksService.createSpec(name);
    }
  
    @Get()
    async getSpecs() {
      return this.mocksService.getSpecs();
    }
  
    @Delete('/:id')
    async deleteSpecs(@Param('id') id: string) {
      return this.mocksService.deleteSpecs(id);
    }

    @Post('/upload/:id')
    @UseInterceptors(FilesInterceptor('files[]'))
    async uploadFile(@UploadedFiles() files, @Param('id') id) {
      return this.mocksService.uploadFile(id, files);
    }

}
