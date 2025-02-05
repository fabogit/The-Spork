import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSqlService } from './sql.service';

describe('DatabaseSqlService', () => {
  let service: DatabaseSqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseSqlService],
    }).compile();

    service = module.get<DatabaseSqlService>(DatabaseSqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
