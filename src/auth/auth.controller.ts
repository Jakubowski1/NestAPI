import { Controller, Post, Body, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req, @Response() res) {
    const { token, user } = await this.authService.login(req.user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
    });
    return res.send(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: User })
  async register(@Body() user: User) {
    return this.authService.register(user);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Log out' })
  async logout(@Request() req, @Response() res) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
    });
    return res.send({ message: 'Logged out successfully' });
  }
}
