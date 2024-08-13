import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';

@Injectable() 
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      console.log('Validation failed: User not found');
      return null;
    }
    console.log('Plaintext password:', pass);
    console.log('Stored hashed password:', user.password);
  
    try {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      console.log('Password validation result:', isPasswordValid);
  
      if (isPasswordValid) {
        const { password, ...result } = user;
        console.log('Validation successful:', result);
        return result;
      } else {
        console.log('Validation failed: Incorrect password');
        return null;
      }
    } catch (error) {
      console.error('Error during password validation:', error.message);
      return null;
    }
    
  }
  
  async login(user: any) {
    const payload = { username: user.username, id: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }

  async register(user: User): Promise<User> {

    const newUser = await this.usersService.create({ ...user, password: user.password });
    console.log('Registered new user:', newUser); 
    return newUser;
    
  }
}
