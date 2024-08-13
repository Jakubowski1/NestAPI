import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Post as PostEntity } from './post.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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
    user: mockUser,  // Include the user property here
  };

  const mockRequest = {
    user: { id: 1, roles: ['user'] },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
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
  describe('findAll', () => {
    it('should return an array of posts', async () => {
      mockPostsService.findAll.mockReturnValue([mockPost]);
      const result = await postsController.findAll();
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      mockPostsService.findOne.mockReturnValue(mockPost);
      const result = await postsController.findOne(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if the post is not found', async () => {
      mockPostsService.findOne.mockReturnValue(null);
      await expect(postsController.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto = { title: 'New Post', content: 'New Content' };
      mockPostsService.create.mockReturnValue(mockPost);

      const result = await postsController.create(mockRequest, createPostDto);
      expect(result).toEqual(mockPost);
      expect(postsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createPostDto.title,
          content: createPostDto.content,
          userId: mockRequest.user.id,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a post if the user is the owner', async () => {
      mockPostsService.findOne.mockReturnValue(mockPost);
      mockPostsService.update.mockReturnValue(mockPost);

      const updatePostDto = { title: 'Updated Title', content: 'Updated Content' };
      const result = await postsController.update(mockRequest, 1, updatePostDto);
      expect(result).toEqual(mockPost);
      expect(postsService.update).toHaveBeenCalledWith(1, expect.objectContaining(updatePostDto));
    });

    it('should throw NotFoundException if the post is not found', async () => {
      mockPostsService.findOne.mockReturnValue(null);
      const updatePostDto = { title: 'Updated Title' };

      await expect(
        postsController.update(mockRequest, 1, updatePostDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user is not the owner', async () => {
      const anotherUserPost = { ...mockPost, userId: 2 };
      mockPostsService.findOne.mockReturnValue(anotherUserPost);
      const updatePostDto = { title: 'Updated Title' };

      await expect(
        postsController.update(mockRequest, 1, updatePostDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a post if the user is the owner', async () => {
      mockPostsService.findOne.mockReturnValue(mockPost);

      const result = await postsController.delete(mockRequest, 1);
      expect(result).toBeUndefined();
      expect(postsService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if the post is not found', async () => {
      mockPostsService.findOne.mockReturnValue(null);

      await expect(postsController.delete(mockRequest, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user is not the owner', async () => {
      const anotherUserPost = { ...mockPost, userId: 2 };
      mockPostsService.findOne.mockReturnValue(anotherUserPost);

      await expect(postsController.delete(mockRequest, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
