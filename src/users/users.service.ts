import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { WinstonLoggerService } from '../logger/logger.service'; 

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly logger: WinstonLoggerService,  
  ) {}

  async findAll(): Promise<User[]> {
    this.logger.log('Finding all users');
    const users = await this.usersRepository.find({ relations: ['posts'] });
    this.logger.log(`Found ${users.length} users`);
    return users;
  }

  async findOne(id: number): Promise<User> {
    this.logger.log(`Finding user with ID: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['posts'] });
    if (user) {
      this.logger.log(`Found user: ${user.username}`);
    } else {
      this.logger.warn(`User with ID: ${id} not found`);
    }
    return user;
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    this.logger.log(`Finding user with username: ${username}`);
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      this.logger.log(`Found user: ${user.username}`);
    } else {
      this.logger.warn(`User with username: ${username} not found`);
    }
    return user;
  }

  async create(user: User): Promise<User> {
    this.logger.log(`Creating a new user: ${user.username}`);
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    this.logger.log(`Created user with ID: ${savedUser.id}`);
    return savedUser;
  }

  async update(id: number, user: User): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);
    if (user.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
      this.logger.log('User password has been hashed');
    }
    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOne({ where: { id }, relations: ['posts'] });
    if (updatedUser) {
      this.logger.log(`Updated user: ${updatedUser.username}`);
    } else {
      this.logger.warn(`User with ID: ${id} not found after update`);
    }
    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting user with ID: ${id}`);
    const result = await this.usersRepository.delete(id);
    if (result.affected) {
      this.logger.log(`Deleted user with ID: ${id}`);
    } else {
      this.logger.warn(`User with ID: ${id} not found or could not be deleted`);
    }
  }
}
