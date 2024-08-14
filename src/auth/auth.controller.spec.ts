import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WinstonLoggerService } from '../logger/logger.service';
import { User } from 'src/users/user.entity'; 
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: WinstonLoggerService, 
          useValue: mockLoggerService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should log in the user and return the user with a JWT cookie', async () => {
      const mockRequest = {
        user: { username: 'testuser', id: 1 },
      };
      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn(),
      };
      const mockToken = 'mockJwtToken';
      const mockUser = { username: 'testuser', id: 1 };

      mockAuthService.login.mockResolvedValue({ token: mockToken, user: mockUser });

      await authController.login(mockRequest, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockRequest.user);
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
      expect(mockLoggerService.log).toHaveBeenCalledWith(`User ${mockUser.username} logged in successfully`);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser: User = { id: 1, username: 'newuser', password: 'password' } as User;     
       mockAuthService.register.mockResolvedValue(mockUser);

      const result = await authController.register(mockUser);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockUser);
      expect(mockLoggerService.log).toHaveBeenCalledWith(`Registered new user with ID: ${mockUser.id}`);
    });
  });

  describe('logout', () => {
    it('should log out the user and clear the JWT cookie', async () => {
      const mockRequest = {
        user: { username: 'testuser', id: 1 },
      };
      const mockResponse = {
        clearCookie: jest.fn(),
        send: jest.fn(),
      };

      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Logged out successfully' });
      expect(mockLoggerService.log).toHaveBeenCalledWith(`User ${mockRequest.user.username} logged out successfully`);
    });
  });
});
