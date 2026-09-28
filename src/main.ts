import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.enableCors();

  // API route prefix
  app.setGlobalPrefix('api/v1');

  //DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  
  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(new LoggingInterceptor(prismaService));

  //  Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('EchoGPT Backend REST API')
    .setDescription('Production-ready backend API documentation for EchoGPT Chrome Extension')
    .setVersion('1.0')
    .addTag('Authentication', 'User registration, login, token rotation, and verification')
    .addTag('Users', 'User profile, password updates, and account lifecycle')
    .addTag('Subscriptions', 'Tier plans, request quotas, and subscription updates')
    .addTag('AI Providers', 'Multi-model provider configurations and health probes')
    .addTag('Chat', 'Conversational AI engine, multi-turn messages, and token usage')
    .addTag('Web Search', 'AI-assisted web query execution, suggestions, and history')
    .addTag('Admin Analytics', 'System-wide usage telemetry, request logs, and metrics')
    .addTag('System Health', 'Liveness probes and database connection verification')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

 
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none', // Keeps tags collapsed so the list is clean and readable
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();