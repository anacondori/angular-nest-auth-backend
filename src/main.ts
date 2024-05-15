import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); //para q NO de ERROR al llamarlo desde el frontal. 
  //Da permiso para q se use el BACK desde localhost o cualquier otro puesto q este dentro del DOMINIO

  app.useGlobalPipes(    
    new ValidationPipe({ 
          whitelist: true, 
          forbidNonWhitelisted: true,   
      }) 
  );

  await app.listen(process.env.PORT??3000);//se ejecuta en el puerto 3000 // ?? = ||
}
bootstrap();
