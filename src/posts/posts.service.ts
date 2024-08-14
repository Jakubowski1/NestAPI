import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { WinstonLoggerService } from '../logger/logger.service'; 

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly logger: WinstonLoggerService,  
  ) {}

  async findAll(): Promise<Post[]> {
    this.logger.log('Finding all posts');
    const posts = await this.postRepository.find({ relations: ['user'] });
    this.logger.log(`Found ${posts.length} posts`);
    return posts;
  }

  async findOne(id: number): Promise<Post> {
    this.logger.log(`Finding post with ID: ${id}`);
    const post = await this.postRepository.findOne({ where: { id }, relations: ['user'] });
    if (post) {
      this.logger.log(`Found post with ID: ${id}`);
    } else {
      this.logger.warn(`Post with ID: ${id} not found`);
    }
    return post;
  }

  async create(post: Post): Promise<Post> {
    this.logger.log(`Creating a new post`);
    const newPost = await this.postRepository.save(post);
    this.logger.log(`Created post with ID: ${newPost.id}`);
    return newPost;
  }

  async update(id: number, post: Post): Promise<Post> {
    this.logger.log(`Updating post with ID: ${id}`);
    await this.postRepository.update(id, post);
    const updatedPost = await this.findOne(id);
    if (updatedPost) {
      this.logger.log(`Updated post with ID: ${id}`);
    } else {
      this.logger.warn(`Post with ID: ${id} not found after update`);
    }
    return updatedPost;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting post with ID: ${id}`);
    const result = await this.postRepository.delete(id);
    if (result.affected) {
      this.logger.log(`Deleted post with ID: ${id}`);
    } else {
      this.logger.warn(`Post with ID: ${id} not found or could not be deleted`);
    }
  }
}
