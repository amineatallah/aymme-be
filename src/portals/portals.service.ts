import { Injectable, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PortalModel } from '../interfaces/portalModel.interface';
import { cleanModel } from '../helpers/helpers';
import { AuthService } from 'src/helpers/authService';
const querystring = require('querystring');

@Injectable()
export class PortalsService {

  constructor(
    @InjectModel('PortalModel') private readonly portalModel: Model<PortalModel>,
    private readonly httpService: HttpService,
    private readonly authService: AuthService
  ) {

  }

  async getPortals() {
    let portals = await this.portalModel.find();
    portals = portals.map(portal => {


      return {
        name: portal.name,
        username: portal.username,
        password: portal.password,
        modelUrl: portal.modelUrl,
        host: portal.host,
        useIdentity: portal.useIdentity,
        identityLoginUrl: portal.identityLoginUrl,
        loginUrl: portal.loginUrl,
        activePage: portal.activePage,
        pages: portal.pages
      }
    })
    return portals;
  }

  async deletePortal(name) {
    let deleted = await this.portalModel.deleteOne({ name: name });
    return deleted;
  }

  // async getModel(portalName) {
  //   let portalModel = await this.portalModel.findOne({ name: portalName });
  //   return {
  //     name: portalModel.name,
  //     host: portalModel.host,
  //     activePage: portalModel.activePage,
  //     loginUrl: portalModel.loginUrl,
  //     pages: JSON.parse(portalModel.pages)
  //   };
  // }

  async getSimpleModel(portalName) {
    let portalModel = await this.portalModel.findOne({ name: portalName });
    let pages = portalModel.pages;
    let page = pages.find(page => page.name === portalModel.activePage);
    return page;
  }

  async syncPortalModel(body) {

    const config = {
      username: body.username,
      password: body.password,
      url: body.useIdentity ? body.identityLoginUrl : `${body.host}${body.loginUrl}`,
    }

    const token = body.useIdentity ? await this.authService.identityLogin(config) : await this.authService.basicLogin(config)

    const result = await this.httpService.get(`${body.host}${body.modelUrl}/${body.experienceName}.json`, { headers: { Cookie: "Authorization=" + token } })
    .toPromise();

    let data = JSON.stringify(result.data).replace(/preferences/g, 'properties');

    let jsonData = JSON.parse(data);

    let newActivePage = null;

    if (jsonData.pages.length > 0) {
      let indexPage = jsonData.pages.find((page) => page.name === 'index');

      if (indexPage) {
        newActivePage = indexPage.name;
      }
      else {
        newActivePage = jsonData.pages[0].name;
      }
    }

    let model = await this.portalModel.findOneAndUpdate({ name: body.experienceName }, {
      name: jsonData.name,
      username: body.username,
      password: body.password,
      host: body.host,
      loginUrl: body.loginUrl,
      modelUrl: body.modelUrl,
      identityLoginUrl: body.identityLoginUrl,
      pages: cleanModel(jsonData.pages),
      useIdentity: body.useIdentity,
      activePage: newActivePage
    }, { upsert: true, new: true });

    return {
      username: model.username,
      password: model.password,
      name: model.name,
      host: model.host,
      loginUrl: model.loginUrl,
      modelUrl: model.modelUrl,
      useIdentity: model.useIdentity,
      pages: model.pages,
      activePage: model.activePage
    }
  }

  async updatePortalModel(portalName, data) {
    let model = await this.portalModel.findOneAndUpdate({ name: portalName }, data, { new: true });
    return model;
  }

}
