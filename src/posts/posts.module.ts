import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { JwtService } from '@nestjs/jwt';
import { WinstonLoggerService } from 'src/logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostsService,JwtService, WinstonLoggerService],
  controllers: [PostsController]
})
export class PostsModule {}
