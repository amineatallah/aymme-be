import { Test, TestingModule } from '@nestjs/testing';
import { PortalsController } from './portals.controller';

describe('Portals Controller', () => {
  let controller: PortalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortalsController],
    }).compile();

    controller = module.get<PortalsController>(PortalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
