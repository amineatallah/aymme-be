import { Test, TestingModule } from '@nestjs/testing';
import { EndPointsService } from './end-points.service';

describe('EndPointsService', () => {
  let service: EndPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EndPointsService],
    }).compile();

    service = module.get<EndPointsService>(EndPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
