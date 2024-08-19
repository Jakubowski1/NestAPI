import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonLoggerService } from '../logger/logger.service';

describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'testpassword',
    role: 'user',
    posts: [],
  };

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    userId: mockUser.id,
    user: mockUser,
  };

  const mockPostRepository = {
    find: jest.fn().mockResolvedValue([mockPost]),
    findOne: jest.fn().mockResolvedValue(mockPost),
    save: jest.fn().mockResolvedValue(mockPost),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockPost]);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['user'] });
      expect(mockLoggerService.log).toHaveBeenCalledWith('Finding all posts');
      expect(mockLoggerService.log).toHaveBeenCalledWith('Found 1 posts');
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockPost);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith('Finding post with ID: 1');
    });

    it('should return null if no post is found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null); 
      const result = await service.findOne(999);
      expect(result).toBeNull();
      expect(mockLoggerService.warn).toHaveBeenCalledWith('Post with ID: 999 not found');
    });
  });

  describe('create', () => {
    it('should successfully insert a post', async () => {
      const result = await service.create(mockPost);
      expect(result).toEqual(mockPost);
      expect(repository.save).toHaveBeenCalledWith(mockPost);
      expect(mockLoggerService.log).toHaveBeenCalledWith('Creating a new post');
    });
  });

  describe('update', () => {
    it('should successfully update a post', async () => {
      const updatedPost = { ...mockPost, title: 'Updated Title' };
      (repository.findOne as jest.Mock).mockResolvedValue(updatedPost); 

      const result = await service.update(1, updatedPost);
      expect(result.title).toEqual('Updated Title');
      expect(repository.update).toHaveBeenCalledWith(1, updatedPost);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      ///hello 
      expect(mockLoggerService.log).toHaveBeenCalledWith('Updating post with ID: 1');
    });

    it('should return null if the post to update is not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null); 

      const updatedPost = await service.update(999, { ...mockPost, title: 'Updated Title' });
      expect(updatedPost).toBeNull();
      expect(mockLoggerService.warn).toHaveBeenCalledWith('Post with ID: 999 not found after update');
    });
  });

  describe('delete', () => {
    it('should successfully delete a post', async () => {
      const result = await service.delete(1);
      expect(result).toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(mockLoggerService.log).toHaveBeenCalledWith('Deleting post with ID: 1');
    });
  });
});
