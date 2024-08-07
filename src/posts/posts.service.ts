import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Post> {
    return await this.postRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(userId: number, post: Post): Promise<Post> {
    const newPost = this.postRepository.create({ ...post, userId });
    return await this.postRepository.save(newPost);
  }

  async update(id: number, post: Post): Promise<Post> {
    await this.postRepository.update(id, post);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.postRepository.delete(id);
  }
}
