import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { urlencoded } from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Устанавливаем глобальный префикс для всех маршрутов
  app.setGlobalPrefix('api');

  // Настройки body-parser для увеличения лимита размера тела запроса
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Настройки CORS
  app.enableCors({
    origin: '*', // Разрешенный источник запросов (замените на свой домен)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'], // Разрешенные методы HTTP
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки запросов
  });

  // Настройки Swagger
  const config = new DocumentBuilder()
    .setTitle('Kesek-server')
    .setDescription('The Kesek API description')
    .setVersion('1.0')
    .addTag('user')
    .addTag('tour')
    .addTag('review')
    .addTag('sight')
    .addTag('booked-tour')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Запуск сервера
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
