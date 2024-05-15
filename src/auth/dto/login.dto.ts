import { IsEmail, MinLength } from "class-validator";

export class LoginDto {//DTO= data transfer object
    @IsEmail()
    email:string;
    
    @MinLength(6)
    password:string;
}    