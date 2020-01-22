import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { EndPointSchema } from '../end-points/schemas/endpoint.schema';
import { MockSchema } from '../schemas/mocks.schema';
import { PortalModelSchema } from '../schemas/portalModel.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Endpoint', schema: EndPointSchema },
      { name: 'Mock', schema: MockSchema},
      { name: 'PortalModel', schema: PortalModelSchema}
    ])
  ],
  controllers: [ApiController],
  providers: [ApiService]
})
export class ApiModule { }
