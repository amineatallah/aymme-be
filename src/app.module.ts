import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/app-config';
import { EndPointsModule } from './end-points/end-points.module';
import { ApiModule } from './api/api.module';
import { MocksModule } from './mocks/mocks.module';
import { PortalsModule } from './portals/portals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.host') + configService.get('database.name'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }),
      inject: [ConfigService]
    }),
    EndPointsModule,
    ApiModule,
    MocksModule,
    PortalsModule
  ],
})
export class AppModule { }
