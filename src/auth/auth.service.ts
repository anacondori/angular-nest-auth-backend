import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';


@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name )  //@InjectModel( User.name, 'users' )  
    private userModel: Model<User>,
    private jwtService: JwtService,
              ){}


  async create(createUserDto: CreateUserDto):Promise<User>{
    console.log('create',{createUserDto});
    // const newUser = new this.userModel(createUserDto);
    // //return 'This action adds a new auth';
    // return newUser.save();

    try{
      // 1. Encriptar la contraseña
        //+instalar en la terminal: npm i bcryptjs
        //+importar bcryptjs y luego instalar: npm i --save-dev @type/bcryptjs
      const {password, ...userData} = createUserDto;    
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });
      //return await newUser.save(); //await... si da error se ejecuta dentro del try{}

      // 2. Guardar el usuario
      await newUser.save();
      const {password:_, ...user} = newUser.toJSON();
      return user;
  
      // 3. Generar el JWT (JSON Web Token (JWT) es un estándar abierto (RFC7519) que define un modo ​compacto y ​autocontenido ​para transmitir información segura entre distintas partes utilizando objetos JSON)
        //+instalar en la terminal: npm install --save @nestjs/jwt
        //+en el constructor añadir: private jwtService: JwtService e importar import { JwtService } from '@nestjs/jwt';
        //+se crea metodo getJwtToken y se define una interface jwt-payload.ts
      
    } catch (err){
      if ( err.code === 11000){
        throw new BadRequestException(`${ createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something terrible happend!!!');
    }

  }


  async register(registerDto: RegisterUserDto):Promise<LoginResponse>{

    const user = await this.create(registerDto);//{email:registerDto.email, name:registerDto.name, etc}

    return {
      user: user,
      token: this.getJwtToken({id: user._id}),
   }
  }

  async login(loginDto: LoginDto):Promise<LoginResponse>{
    /* esta funcion retorna:
    user { _id, name, email, roles }. se crea un nuevo fichero dto 
    Token de acceso -> este Token es un JWT
    */
   console.log({loginDto});

   const {email, password} = loginDto;
   const user = await this.userModel.findOne({ email });//{ email: email}

   //valida el usuario de postman con la BBDD
   if (!user) throw new UnauthorizedException('Not valid credentials - email');

   //verifica la contraseña de postman con la BBDD
   if (!bcryptjs.compareSync( password, user.password )) throw new UnauthorizedException('Not valid credentials - password');

   //return 'Todo Bien!';
   
   const {password: _, ...rest} = user.toJSON();

   return {
      user: rest,
      token: this.getJwtToken({ id: user.id}),
   }
  }



  findAll(): Promise<User[]> {//retorna todos los usuarios
    //return `This action returns all auth`;
    return this.userModel.find();
  }


  async findUserById(id:string){
    const user = await this.userModel.findById( id );
    const {password: _, ...rest} = user.toJSON();
    return rest;
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  getJwtToken( payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;  
  }

}
