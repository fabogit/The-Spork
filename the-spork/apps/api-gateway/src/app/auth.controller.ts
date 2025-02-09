import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '@the-spork/shared';

@Controller('auth') // Define the base route for this controller
export class AuthController {
  @Post('register') // Handle POST requests to /auth/register
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    // In a real application, you would send this createUserDto to the User Service
    // via tRPC or another communication method.
    console.log('Received registration request with DTO:', createUserDto);
    return {
      message: 'Registration endpoint hit, validation passed!',
      data: createUserDto,
    };
  }
}
