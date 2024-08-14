import { Controller, Post, Body, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { WinstonLoggerService } from '../logger/logger.service';  
import { InvalidCredentialsException, RegistrationFailedException, InternalServerErrorException } from '../exceptions/custom-exceptions';  


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: WinstonLoggerService,  
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req, @Response() res) {
    this.logger.log(`User ${req.user.username} attempting to log in`);
    try {
      const { token, user } = await this.authService.login(req.user);
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
      });
      this.logger.log(`User ${user.username} logged in successfully`);
      return res.send(user);
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      throw new InvalidCredentialsException();
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: User })
  async register(@Body() user: User) {
    this.logger.log(`Attempting to register user with username: ${user.username}`);
    
    const newUser = await this.authService.register(user);
    if (!newUser) {
      throw new RegistrationFailedException();
    }
    this.logger.log(`Registered new user with ID: ${newUser.id}`);
    return newUser;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Log out' })
  async logout(@Request() req, @Response() res) {
    this.logger.log(`User ${req.user.username} attempting to log out`);
    try {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
      });
      this.logger.log(`User ${req.user.username} logged out successfully`);
      return res.send({ message: 'Logged out successfully' });
    } catch (error) {
      this.logger.error('Logout failed', error.stack);
      throw new InternalServerErrorException('An unexpected error occurred during logout');
    }
  }
}
