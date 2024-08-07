// src/app.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdminService } from './admin/admin.service';
import { UsersService } from './users/users.service';
import { User } from './users/user.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    const admin = new User();
       admin.username = 'admin';
    admin.password = 'admin'; // Password will be hashed in the service
    admin.role = 'admin';
    admin.posts = [];

    const createdAdmin = await this.adminService.createAdmin(admin);
    console.log('Admin user created:', createdAdmin);

    const user = new User();
    user.username = 'user_username';
    user.password = 'user_password'; // Password will be hashed in the service
    user.role = 'user';
    user.posts = [];

    const createdUser = await this.usersService.create(user);
    console.log('User created:', createdUser);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
