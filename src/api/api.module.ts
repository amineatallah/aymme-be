import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ProjectSchema } from '../end-points/schemas/endpoint.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Project', schema: ProjectSchema}
    ])
  ],
  controllers: [ApiController],
  providers: [ApiService]
})
export class ApiModule { }
