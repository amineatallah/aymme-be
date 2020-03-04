import { Controller, Get, Req, Query, Headers, Session, Param, Res, Post, Body, HttpService } from '@nestjs/common';
import { EndPointsService } from './end-points.service';

@Controller('gateway')
export class EndPointsController {
  constructor(private endPointsService: EndPointsService, private readonly httpService: HttpService) {}

  @Post('/api/auth/login')
  async interceptLogin(@Body() body, @Res() res){
    const login = await this.httpService.post('http://panda-editorial.backbase.test/gateway/api/auth/login', { username: 'admin', password: 'admin' }).toPromise();
    res.cookie('Authorization', login.data.access_token, {httpOnly: true});
    return res.send({});
  }

  @Get('*')
  @Post('*')
  async interceptEndpoints(@Req() req, @Query() query, @Headers() headers, @Session() session, @Param() param, @Res() res) {

    const endpoint = await this.endPointsService.interceptEnpoints(req._parsedUrl.pathname, query);
    // if(endpoint.forward){
    //   return this.endPointsService.forwardRequest();
    // } else {

    // console.log('endpoints.customHeaders', endpoint.customHeaders.values());
      return res
              .set(endpoint.customHeaders)
              .status(endpoint.statusCode)
              .send(endpoint.response[endpoint.statusCode]);
    // }
  }

}
