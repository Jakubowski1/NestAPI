import { Injectable, OnModuleInit } from '@nestjs/common';

import { UsersService } from './users/users.service';
import { User } from './users/user.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(

    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    const user = new User();
    user.username = 'user';
    user.password = 'user'; 
    user.role = 'user';
    user.posts = [];

    const createdUser = await this.usersService.create(user);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
