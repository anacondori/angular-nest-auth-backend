import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';

import { AuthService } from './auth.service';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Controller('auth')//localhost:3000/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  
  @Post('/login')//localhost:3000/auth/login
  login(@Body() loginDto: LoginDto){
    //return 'Login works!';
    return this.authService.login(loginDto);
  }
  
  @Post('/register')//localhost:3000/auth/register
    register(@Body() registerDto: RegisterUserDto){
      return this.authService.register(registerDto);
    }


  @UseGuards(AuthGuard)
  @Get()//localhost:3000/auth
  findAll( @Request() req: Request) {
    const user = req['user'];
    //console.log('findAll.req',req);

    //return user; //retorna solo el usuario q tiene el token
    return this.authService.findAll(); //retorna todos los usuarios
  }

  //LoginResponse
  @UseGuards(AuthGuard)
  @Get('check-token')//localhost:3000/auth/check-token
  checkToken(@Request() req: Request): LoginResponse{
    const user = req['user'] as User;
    //console.log('checkToken.req',req);
    return {
      user: user,
      token: this.authService.getJwtToken({ id: user._id}),
    };
  }




  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
