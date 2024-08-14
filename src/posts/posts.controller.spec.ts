import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Post as PostEntity } from './post.entity';
import { PostNotFoundException, UnauthorizedPostAccessException } from '../exceptions/custom-exceptions';
import { WinstonLoggerService } from '../logger/logger.service';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'testpassword',
    role: 'user',
    posts: [],
  };

  const mockPostsService = {
    findAll: jest.fn(() => []),
    findOne: jest.fn((id: number) => null),
    create: jest.fn((post: PostEntity) => post),
    update: jest.fn((id: number, post: PostEntity) => post),
    delete: jest.fn(() => undefined),
  };

  const mockPost: PostEntity = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    userId: mockUser.id,
    user: mockUser,
  };

  const mockRequest = {
    user: { id: 1, roles: ['user'] },
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLoggerService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw PostNotFoundException if the post is not found', async () => {
      mockPostsService.findOne.mockReturnValue(null);
      await expect(postsController.findOne(1)).rejects.toThrow(PostNotFoundException);
    });
  });

  describe('update', () => {
    it('should throw PostNotFoundException if the post is not found', async () => {
      mockPostsService.findOne.mockReturnValue(null);
      const updatePostDto = { title: 'Updated Title' };

      await expect(
        postsController.update(mockRequest, 1, updatePostDto),
      ).rejects.toThrow(PostNotFoundException);
    });

    it('should throw UnauthorizedPostAccessException if the user is not the owner', async () => {
      const anotherUserPost = { ...mockPost, userId: 2 };
      mockPostsService.findOne.mockReturnValue(anotherUserPost);
      const updatePostDto = { title: 'Updated Title' };

      await expect(
        postsController.update(mockRequest, 1, updatePostDto),
      ).rejects.toThrow(UnauthorizedPostAccessException);
    });
  });

  describe('delete', () => {
    it('should throw PostNotFoundException if the post is not found', async () => {
      mockPostsService.findOne.mockReturnValue(null);

      await expect(postsController.delete(mockRequest, 1)).rejects.toThrow(PostNotFoundException);
    });

    it('should throw UnauthorizedPostAccessException if the user is not the owner', async () => {
      const anotherUserPost = { ...mockPost, userId: 2 };
      mockPostsService.findOne.mockReturnValue(anotherUserPost);

      await expect(postsController.delete(mockRequest, 1)).rejects.toThrow(UnauthorizedPostAccessException);
    });
  });
});
