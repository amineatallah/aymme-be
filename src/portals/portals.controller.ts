import { Controller, Get, Delete, Param, Post, Body } from '@nestjs/common';
import { PortalsService } from './portals.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Portals')
@Controller('api/portals')
export class PortalsController {
  
  constructor(private portalsService: PortalsService) { }
  @Get()
  async getPortals() {
    return this.portalsService.getPortals();
  }

  @Delete('/:name')
  async deletePortal(@Param('name') name: string) {
    return this.portalsService.deletePortal(name);
  }

  // @Get('/getmodel/:portalName')
  // async getModel(@Param('portalName') portalName){
  //   console.log('portal', portalName)
  //   return this.portalsService.getModel(portalName);
  // }

  @Get('/simplemodel/:portalName')
  async getSimpleModel(@Param('portalName') portalName: string) {
    return this.portalsService.getSimpleModel(portalName);
  }

  @Post('/syncmodel')
  async syncPortalModel(@Body('portalName') portalName: string, @Body('portalUrl') portalUrl: string, @Body('loginUrl') loginUrl: string) {
    console.log('here');
    return this.portalsService.syncPortalModel(portalName, portalUrl, loginUrl);
  }

  @Post('/updatemodel/:portalName')
  async updatePortalModel(@Param('portalName') portalName: string, @Body() body) {
    return this.portalsService.updatePortalModel(portalName, body);
  }

}
