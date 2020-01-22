import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/app-config';
import { EndPointsModule } from './end-points/end-points.module';
import { ApiModule } from './api/api.module';

// 'mongodb+srv://bbMockServer:nottesting@mocks-w55vb.mongodb.net/mocks', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.host') + configService.get('database.collection'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }),
      inject: [ConfigService]
    }),
    EndPointsModule,
    ApiModule
  ],
})
export class AppModule { }
