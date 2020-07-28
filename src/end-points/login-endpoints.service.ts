import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Project } from "../interfaces/project.interface";
import { AuthService } from "src/helpers/authService";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LoginEndPointsService {
  constructor(
    @InjectModel('Project') private readonly projectModel: Model<Project>,
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  async login(uri, query, body) {
    let token = 'amine';

    return token;
  }
}