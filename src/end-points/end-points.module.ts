import { Module, HttpModule } from '@nestjs/common';
import { EndPointsController } from './end-points.controller';
import { EndPointsService } from './end-points.service';
import { MongooseModule } from '@nestjs/mongoose';

import { ProjectSchema } from './schemas/endpoint.schema';
import { ForwardController } from './forward.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from 'src/helpers/authService';
import { LoginEndPointsService } from './login-endpoints.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([
      {name: 'Project', schema: ProjectSchema}
    ])
  ],
  controllers: [EndPointsController, ForwardController],
  providers: [
    EndPointsService, 
    AuthService,
    LoginEndPointsService
  ]

})
export class EndPointsModule {}
