import { Module } from '@nestjs/common';
import { UsersController } from '.././users/users.controller';
import { UsersService } from '../users/users.service';
import { WinstonLoggerService } from './logger.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, WinstonLoggerService],
})
export class UsersModule {}
