import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private _jwtService: JwtService,
              private _authService: AuthService ){}


  async canActivate( context: ExecutionContext ):Promise<boolean> {    
    const request = context.switchToHttp().getRequest();
    //console.log('request',request);
    const token = this.extractTokenFromHeader(request);
    console.log('token',token);

    if (!token) throw new UnauthorizedException('There is no bearar token');

    try {
      const payload = await this._jwtService.verifyAsync<JwtPayload>(
        token,  {  secret: process.env.JWT_SEED  }  
      );
      //console.log('payload',payload);
      const user = await this._authService.findUserById(payload.id);
      if (!user) throw new UnauthorizedException('User does not exists');
      if (!user.isActive) throw new UnauthorizedException('User is not active');

      request['user'] = user;

    } catch (error) {
      throw new UnauthorizedException('Error en el token');
    }

    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
