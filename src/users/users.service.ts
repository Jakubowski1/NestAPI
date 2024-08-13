import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({ relations: ['posts'] });
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOne({ where: { id }, relations: ['posts'] });
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user; 
   }

  async create(user: User): Promise<User> {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    const newUser = this.usersRepository.create(user);
    return await this.usersRepository.save(newUser);
  }

  async update(id: number, user: User): Promise<User> {
    if (user.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
    }
    await this.usersRepository.update(id, user);
    return await this.usersRepository.findOne({ where: { id }, relations: ['posts'] });
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
