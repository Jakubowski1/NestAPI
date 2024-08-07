import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('admins')
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get all admins' })
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.adminService.findAll();
  }

  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserEntity> {
    const admin = await this.adminService.findOne(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  @ApiOperation({ summary: 'Create a new admin' })
  @ApiBody({ type: UserEntity })
  @Post()
  async create(@Body() admin: UserEntity): Promise<UserEntity> {
    return await this.adminService.createAdmin(admin);
  }
}
