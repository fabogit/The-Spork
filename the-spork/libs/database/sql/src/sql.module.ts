import { Module } from '@nestjs/common';
import { DatabaseSqlService } from './sql.service';

@Module({
  providers: [DatabaseSqlService],
  exports: [DatabaseSqlService],
})
export class DatabaseSqlModule {}
