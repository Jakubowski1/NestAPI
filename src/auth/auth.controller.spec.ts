import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn((user) => {
      return { token: 'test-token', user };
    }),
    register: jest.fn((user: User) => {
      return user;
    }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockLocalAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') {
        return 'test';  
      }
    }),
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
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(LocalAuthGuard)
      .useValue(mockLocalAuthGuard)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should log in the user and return the user with a JWT cookie', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockRequest = { user: mockUser };
      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn(),
      };

      await authController.login(mockRequest, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'test-token', {
        httpOnly: true,
        secure: false, 
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser: User = { id: 1, username: 'newuser', password: 'password' } as User;

      const result = await authController.register(mockUser);

      expect(authService.register).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockUser);
    });
  });

  describe('logout', () => {
    it('should log out the user and clear the JWT cookie', async () => {
      const mockRequest = {};
      const mockResponse = {
        clearCookie: jest.fn(),
        send: jest.fn(),
      };

      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt', {
        httpOnly: true,
        secure: false, 
      });
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});
