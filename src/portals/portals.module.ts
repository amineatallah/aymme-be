import { Module, HttpModule } from '@nestjs/common';
import { PortalsService } from './portals.service';
import { PortalsController } from './portals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PortalModelSchema } from '../schemas/portalModel.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'PortalModel', schema: PortalModelSchema},
    ])    
  ],
  providers: [PortalsService],
  controllers: [PortalsController]
})
export class PortalsModule {}
