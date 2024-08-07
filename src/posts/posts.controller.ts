import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  async findAll(): Promise<PostEntity[]> {
    return await this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number): Promise<PostEntity> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: PostEntity })
  @Roles('user', 'admin')
  async create(@Request() req, @Body() post: PostEntity): Promise<PostEntity> {
    return await this.postsService.create(req.user.id, post);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: PostEntity })
  @Roles('user', 'admin')
  async update(@Request() req, @Param('id') id: number, @Body() post: PostEntity): Promise<PostEntity> {
    const existingPost = await this.postsService.findOne(id);
    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }
    if (existingPost.userId !== req.user.id) {
      throw new ForbiddenException('You can only update your own posts');
    }
    return await this.postsService.update(id, post);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @Roles('user', 'admin')
  async delete(@Request() req, @Param('id') id: number): Promise<void> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== req.user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    return this.postsService.delete(id);
  }
}
