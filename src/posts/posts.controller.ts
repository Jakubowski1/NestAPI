import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { WinstonLoggerService } from '../logger/logger.service';  
import { PostNotFoundException, UnauthorizedPostAccessException } from '../exceptions/custom-exceptions';  
@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly logger: WinstonLoggerService,  
    
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  async findAll(): Promise<PostEntity[]> {
    this.logger.log('Getting all posts');
    const posts = await this.postsService.findAll();
    this.logger.log(`Found ${posts.length} posts`);
    return posts;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number): Promise<PostEntity> {
    this.logger.log(`Getting post with ID: ${id}`);
    const post = await this.postsService.findOne(id);
    if (!post) {
      this.logger.warn(`Post with ID: ${id} not found`);
      throw new PostNotFoundException(id);  
    }
    this.logger.log(`Found post with ID: ${id}`);
    return post;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @Roles('user', 'admin')
  async create(
    @Request() req,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    this.logger.log(`Creating a new post by user ID: ${req.user.id}`);
    const post = new PostEntity();
    post.title = createPostDto.title;
    post.content = createPostDto.content;
    post.userId = req.user.id;
    const createdPost = await this.postsService.create(post);
    this.logger.log(`Created post with ID: ${createdPost.id}`);
    return createdPost;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdatePostDto })
  @Roles('user', 'admin')
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    this.logger.log(`Updating post with ID: ${id} by user ID: ${req.user.id}`);
    const existingPost = await this.postsService.findOne(id);
    if (!existingPost) {
      this.logger.warn(`Post with ID: ${id} not found`);
      throw new PostNotFoundException(id);  
    }
    if (existingPost.userId !== req.user.id) {
      this.logger.warn(
        `User ID: ${req.user.id} attempted to update a post they do not own`,
      );
      throw new UnauthorizedPostAccessException('update');  
    }
    if (updatePostDto.title) existingPost.title = updatePostDto.title;
    if (updatePostDto.content) existingPost.content = updatePostDto.content;
    const updatedPost = await this.postsService.update(id, existingPost);
    this.logger.log(`Updated post with ID: ${updatedPost.id}`);
    return updatedPost;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @Roles('user', 'admin')
  async delete(@Request() req, @Param('id') id: number): Promise<void> {
    this.logger.log(`Deleting post with ID: ${id} by user ID: ${req.user.id}`);
    const post = await this.postsService.findOne(id);
    if (!post) {
      this.logger.warn(`Post with ID: ${id} not found`);
      throw new PostNotFoundException(id);  
    }
    if (post.userId !== req.user.id) {
      this.logger.warn(
        `User ID: ${req.user.id} attempted to delete a post they do not own`,
      );
      throw new UnauthorizedPostAccessException('delete');  
    }
    await this.postsService.delete(id);
    this.logger.log(`Deleted post with ID: ${id}`);
  }
}