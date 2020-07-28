import { Module, HttpModule } from '@nestjs/common';
import { PortalsService } from './portals.service';
import { PortalsController } from './portals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PortalModelSchema } from '../schemas/portalModel.schema';
import { AuthService } from 'src/helpers/authService';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'PortalModel', schema: PortalModelSchema},
    ])    
  ],
  providers: [PortalsService, AuthService],
  controllers: [PortalsController]
})
export class PortalsModule {}
