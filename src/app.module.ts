import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import * as cookieParser from 'cookie-parser';
import JwtCookieMiddleware from './auth/jwt-cookie.middleware';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM to use DATABASE_URL from environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // Use DATABASE_URL from environment variables
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Adjust entity path according to your structure
        migrations: [__dirname + '/migrations/**/*.ts'], // Adjust migrations path if necessary
        synchronize: true, // Recommended to disable in production
        ssl: {
          rejectUnauthorized: false,
        }, // Optional: for SSL configuration, depending on your database setup
      }),
      inject: [ConfigService],
    }),

    // Other feature modules
    UsersModule,
    PostsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), JwtCookieMiddleware)
      .forRoutes('*');
  }
}
