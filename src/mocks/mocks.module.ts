import { Module } from '@nestjs/common';
import { MocksController } from './mocks.controller';
import { MocksService } from './mocks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MockSchema } from 'src/schemas/mocks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Mock', schema: MockSchema},
    ])
  ],
  controllers: [MocksController],
  providers: [MocksService]
})
export class MocksModule {}
