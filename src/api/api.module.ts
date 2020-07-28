import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ProjectSchema } from '../end-points/schemas/endpoint.schema';
import { AuthService } from 'src/helpers/authService';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Project', schema: ProjectSchema}
    ])
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    AuthService]
})
export class ApiModule { }
