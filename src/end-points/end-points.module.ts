import { Module, HttpModule } from '@nestjs/common';
import { EndPointsController } from './end-points.controller';
import { EndPointsService } from './end-points.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EndPointSchema } from './schemas/endpoint.schema';
import { ForwardController } from './forward.controller';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{name: 'Endpoint', schema: EndPointSchema}])
  ],
  controllers: [EndPointsController, ForwardController],
  providers: [EndPointsService]
})
export class EndPointsModule {}
