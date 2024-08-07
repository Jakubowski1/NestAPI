// src/users/dto/create-user.dto.ts

import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class AuthCredentialsDto {

    @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsNotEmpty()

  @MinLength(8)
  @MaxLength(32)
  password: string;
}
