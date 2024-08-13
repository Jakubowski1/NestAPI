import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User as UserEntity } from './user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

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

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    const newUser = new UserEntity();
    newUser.username = createUserDto.username;
    newUser.password = createUserDto.password;
    newUser.role = createUserDto.role;
    return await this.usersService.create(newUser);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserEntity> {
    const existingUser = await this.usersService.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.username) existingUser.username = updateUserDto.username;
    if (updateUserDto.password) existingUser.password = updateUserDto.password;
    if (updateUserDto.role) existingUser.role = updateUserDto.role;
    return await this.usersService.update(id, existingUser);
  }

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
