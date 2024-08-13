import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Post Title' })
  title: string;

  @ApiProperty({ example: 'Post content goes here...' })
  content: string;

}