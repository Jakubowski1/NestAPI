import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User as UserEntity } from './user.entity';
import { UserNotFoundException } from '../exceptions/custom-exceptions';
import { RolesGuard } from '../auth/roles.guard';
import { WinstonLoggerService } from '../logger/logger.service';  // Import the logger service

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser: UserEntity = {
    id: 1,
    username: 'testuser',
    password: 'testpassword',
    role: 'user',
    posts: [],
  };

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: WinstonLoggerService,  // Provide the mock logger service
          useValue: mockLoggerService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) }) 
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await usersController.findAll();
      expect(result).toEqual([mockUser]);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await usersController.findOne(1);
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(usersController.findOne(999)).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createUserDto = { username: 'newuser', password: 'newpassword', role: 'user' };
      const result = await usersController.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
    });
  });

  describe('delete', () => {
    it('should successfully delete a user', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      const result = await usersController.delete(1);
      expect(usersService.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if user is not found during deletion', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(usersController.delete(1)).rejects.toThrow(UserNotFoundException);
    });
  });
});
