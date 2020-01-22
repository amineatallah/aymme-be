import { Controller, Get, Req, Query, Headers, Session, Param, Res } from '@nestjs/common';
import { EndPointsService } from './end-points.service';

@Controller('forward')
export class ForwardController {
  constructor(private endPointsService: EndPointsService) {}

  @Get('*')
  async forwardRequest(@Req() req, @Res() res){
    console.log('forwarded');
    return res.send('yay')
  }

}
