import { DataSource } from 'typeorm';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USERNAME', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'admin'),
  database: configService.get('DATABASE_NAME', 'postgres'),
  entities: [User, Post],
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
});
