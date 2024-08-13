import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  UseGuards,
  Request,
  ForbiddenException
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
  @ApiBody({ type: CreatePostDto })
  @Roles('user', 'admin')
  async create(
    @Request() req,
    @Body() createPostDto: CreatePostDto
  ): Promise<PostEntity> {
    const post = new PostEntity();
    post.title = createPostDto.title;
    post.content = createPostDto.content;
    post.userId = req.user.id; 
    return await this.postsService.create(post);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdatePostDto })
  @Roles('user', 'admin')
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto
  ): Promise<PostEntity> {
    const existingPost = await this.postsService.findOne(id);
    console.log(req.user);
    console.log(existingPost);
    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }
    if (existingPost.userId !== req.user.id) {
      throw new ForbiddenException('You can only update your own posts');
    }
    if (updatePostDto.title) existingPost.title = updatePostDto.title;
    if (updatePostDto.content) existingPost.content = updatePostDto.content;
    return await this.postsService.update(id, existingPost);
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
