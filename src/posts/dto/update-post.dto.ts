import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({ example: 'Updated Post Title', required: false })
  title?: string;

  @ApiProperty({ example: 'Updated post content goes here...', required: false })
  content?: string;
}
