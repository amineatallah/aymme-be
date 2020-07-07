import { Controller, Get, Req, Query, Headers, Session, Param, Res, Post, Body, HttpService, All } from '@nestjs/common';
import { EndPointsService } from './end-points.service';
import { LoginEndPointsService } from './login-endpoints.service';

@Controller('intercept')
export class EndPointsController {
  constructor(
    private endPointsService: EndPointsService, 
    private loginEndPointsService: LoginEndPointsService,
    private readonly httpService: HttpService) {}

  // @Post('/api/auth/login')
  // async interceptLogin(@Body() body, @Res() res){
  //   const login = await this.httpService.post('http://panda-editorial.backbase.test/gateway/api/auth/login', { username: 'admin', password: 'admin' }).toPromise();
  //   res.cookie('Authorization', login.data.access_token, {httpOnly: true});
  //   return res.send({});
  // }

  // @Post('*login*')
  // async interceptLogin(@Req() req, @Query() query, @Headers() headers, @Body() body, @Res() res) {
  //   // const endpoint = await this.loginEndPointsService.login();
  //   return res
  //           .cookie('tokensss','amine', { httpOnly: true, secure: true })
  //           .send('okk');
  // }

  @All('*')
  async interceptEndpoints(@Req() req, @Query() query, @Headers() headers, @Body() body, @Res() res) {
    const endpoint = await this.endPointsService.interceptEnpoints(req._parsedUrl.pathname, query, body);
      return res
              .set(endpoint.customHeaders)
              .status(endpoint.statusCode)
              .send(endpoint.response[endpoint.statusCode]);
  }
}
