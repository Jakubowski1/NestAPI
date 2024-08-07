import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User as UserEntity } from './user.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody,  ApiBearerAuth  } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  // Get one user
  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number): Promise<UserEntity> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Create user with signup
  @Post('/signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: UserEntity })
  async signUp(@Body() user: UserEntity): Promise<UserEntity> {
    return await this.usersService.create(user);
  }

  // Create user
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: UserEntity })
  async create(@Body() user: UserEntity): Promise<UserEntity> {
    return await this.usersService.create(user);
  }

  // Update user
  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UserEntity })
  async update(@Param('id') id: number, @Body() user: UserEntity): Promise<UserEntity> {
    const updatedUser = await this.usersService.update(id, user);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // Delete user
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: 'number' })
  async delete(@Param('id') id: number): Promise<void> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.delete(id);
  }
}
