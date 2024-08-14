import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { WinstonLoggerService } from '../logger/logger.service';  

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: WinstonLoggerService,  
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    this.logger.log(`Validating user with username: ${username}`);
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      this.logger.warn(`Validation failed: User with username ${username} not found`);
      return null;
    }

    this.logger.log('Attempting password validation');
    try {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      this.logger.log(`Password validation result: ${isPasswordValid}`);

      if (isPasswordValid) {
        const { password, ...result } = user;
        this.logger.log(`Validation successful for user: ${username}`);
        return result;
      } else {
        this.logger.warn(`Validation failed: Incorrect password for user ${username}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error during password validation for user ${username}`, error.stack || 'No stack trace available');
      return null;
    }
  }

  async login(user: any) {
    this.logger.log(`Logging in user: ${user.username}`);
    const payload = { username: user.username, id: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    this.logger.log(`Generated JWT token for user: ${user.username}`);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(user: User): Promise<User> {
    this.logger.log(`Registering new user with username: ${user.username}`);
    const newUser = await this.usersService.create({ ...user, password: user.password });
    this.logger.log(`Registered new user with ID: ${newUser.id}`);
    return newUser;
  }
}
