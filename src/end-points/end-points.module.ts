import { Module, HttpModule } from '@nestjs/common';
import { EndPointsController } from './end-points.controller';
import { EndPointsService } from './end-points.service';
import { MongooseModule } from '@nestjs/mongoose';

import { ProjectSchema } from './schemas/endpoint.schema';
import { ForwardController } from './forward.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([
      {name: 'Project', schema: ProjectSchema}
    ])
  ],
  controllers: [EndPointsController, ForwardController],
  providers: [EndPointsService]
})
export class EndPointsModule {}
