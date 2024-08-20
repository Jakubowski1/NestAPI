import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file if not already loaded

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [User, Post],
  migrations: [__dirname + '/migrations/**/*.ts'],
  synchronize: false,  // Recommended to keep this false in production
  ssl: {
    rejectUnauthorized: false,
  },
});
