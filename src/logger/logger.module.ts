import { Module } from '@nestjs/common';
import { UsersController } from '.././users/users.controller';
import { UsersService } from '../users/users.service';
import { WinstonLoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';


@Module({
  controllers: [UsersController],
  providers: [UsersService, WinstonLoggerService],
  exports: [WinstonModule],
  
})
export class UsersModule {}
