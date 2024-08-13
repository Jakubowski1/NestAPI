import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'john_doe', required: false })
  username?: string;

  @ApiProperty({ example: 'strong_password', required: false })
  password?: string;

  @ApiProperty({ example: 'user', default: 'user', required: false })
  role?: string = 'user';
}
