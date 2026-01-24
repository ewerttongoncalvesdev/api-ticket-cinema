import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Cinema - Sistema de Ingressos')
    .setDescription('Sistema de venda de ingressos para cinema com controle de concorrência')
    .setVersion('1.0')
    .addTag('sessions', 'Gestão de sessões de cinema')
    .addTag('seats', 'Gestão de assentos')
    .addTag('reservations', 'Reserva de ingressos')
    .addTag('sales', 'Vendas confirmadas')
    .addTag('health', 'Verificação de saúde')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  logger.log(`🚀 Aplicação rodando em: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Documentação Swagger: http://localhost:${port}/api-docs`);
  logger.log(`💚 Health check: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();