import { Injectable, HttpService } from "@nestjs/common";
const querystring = require('querystring');

@Injectable()
export class AuthService  {
  tokens = {};
  constructor(private readonly httpService: HttpService){}

  resetToken(projectName){
    this.tokens[projectName] = null;
  }

  getToken(projectName) {
    return this.tokens[projectName];
  }

  async basicLogin({url, username, password}) {

    const login = await this.httpService.post(url, querystring.stringify({ username, password}), 
    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).toPromise(); 
    return login.data.access_token;
  }

  async identityLogin({username, password, url, grant_type, client_id, projectName = null}) {
    if(this.tokens[projectName]) return;
    
    const login = await this.httpService.post(url, querystring.stringify({ username, password, grant_type, client_id}), 
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).toPromise();
    
    if(projectName) {
      this.tokens[projectName] = login.data.access_token;
    }
    return login.data.access_token; 
  }
}