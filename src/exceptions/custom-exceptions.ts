import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(id: number) {
    super(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}
export class InternalServerErrorException extends HttpException {
  constructor(username: string) {
    super(`Internal Server Error`, HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid credentials provided', HttpStatus.UNAUTHORIZED);
  }
}

export class RegistrationFailedException extends HttpException {
  constructor() {
    super('User registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class PostNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Post with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedPostAccessException extends HttpException {
  constructor(action: string) {
    super(`You are not authorized to ${action} this post`, HttpStatus.FORBIDDEN);
  }
}