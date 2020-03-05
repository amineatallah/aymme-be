import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { EndPointSchema, ProjectSchema } from '../end-points/schemas/endpoint.schema';
// import { PortalModelSchema } from '../schemas/portalModel.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      // { name: 'Endpoint', schema: EndPointSchema },
      // { name: 'PortalModel', schema: PortalModelSchema},
      { name: 'Project', schema: ProjectSchema}
    ])
  ],
  controllers: [ApiController],
  providers: [ApiService]
})
export class ApiModule { }
