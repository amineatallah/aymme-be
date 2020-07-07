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
    console.log('gettoken', this.tokens[projectName]);
    return this.tokens[projectName];
  }

  async basicLogin({url, username, password}) {

    const login = await this.httpService.post(url, querystring.stringify({ username, password}), 
    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).toPromise(); 
    return login.data.access_token;
  }

  async identityLogin({username, password, url, projectName = null}) {
    if(this.tokens[projectName]) return;
    console.log("projectname identitylogin", projectName, url);
    
    const login = await this.httpService.post(url, querystring.stringify({ username, password, grant_type: 'password', client_id: 'bb-tooling-client'}), 
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).toPromise();
    
    if(projectName) {
      this.tokens[projectName] = login.data.access_token;
    }
    console.log('login.data', login.data);
    return login.data.access_token; 
  }
}