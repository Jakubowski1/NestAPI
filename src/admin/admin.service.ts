// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
  ) {}

  async createAdmin(adminData: User): Promise<User> {
    const salt = await bcrypt.genSalt();
    adminData.password = await bcrypt.hash(adminData.password, salt);
    const admin = this.adminRepository.create(adminData);
    return await this.adminRepository.save(admin);
  }

  async findOne(id: number): Promise<User> {
    return this.adminRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.adminRepository.find();
  }
}
