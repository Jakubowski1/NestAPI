import { DataSource } from 'typeorm';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',

  // If DATABASE_URL is available, use it. Otherwise, use individual configs.
  url: configService.get('DATABASE_URL') || undefined,

  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USERNAME', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'admin'),
  database: configService.get('DATABASE_NAME', 'postgres'),

  entities: [User, Post],
  synchronize: false,  // Should be false in production to avoid unintentional schema changes
  migrations: ['src/migrations/*.ts'],
});
