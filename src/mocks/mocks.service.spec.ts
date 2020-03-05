import { Test, TestingModule } from '@nestjs/testing';
import { MocksService } from './mocks.service';

describe('MocksService', () => {
  let service: MocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MocksService],
    }).compile();

    service = module.get<MocksService>(MocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
