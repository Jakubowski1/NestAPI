import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file if not already loaded

// Create a ConfigService instance to fetch environment variables
const configService = new ConfigService();
console.log('DATABASE_URL:', configService.get<string>('DATABASE_URL'));
export const AppDataSource = new DataSource({
  type: 'postgres',  // Explicitly define the database type
  host: configService.get<string>('PG_HOST', 'localhost'),
  port: configService.get<number>('PG_PORT', 5432),
  username: configService.get<string>('PG_USER', 'postgres'),
  password: configService.get<string>('PG_PASSWORD', 'admin'),
  database: configService.get<string>('PG_DB', 'postgres'),
  entities: [User, Post],
  migrations: [__dirname + '/migrations/**/*.ts'],
  synchronize: configService.get<boolean>('TYPEORM_SYNC', false),  // Disable synchronize in production
  url: configService.get<string>('DATABASE_URL') || undefined, // Use DATABASE_URL if available
});
