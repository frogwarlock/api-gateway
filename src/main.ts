import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Marketplace API Gateway')
    .setDescription(
      [
        'API Gateway para o sistema de Marketplace com microserviços.',
        '',
        '## Serviços incluídos',
        '- **User Service**: Gerenciamento de usuários, autenticação e autorização.',
        '- **Product Service**: Catálogo e gerenciamento de produtos.',
        '- **Checkout Service**: Carrinho e processamento de pedidos.',
        '- **Payment Service**: Processamento de pagamentos.',
        '',
        '## Autenticação',
        '- Use JWT Bearer tokens para rotas protegidas.',
        '- Use Session token para validação de sessão.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .setContact(
      'Zalu learning at Rocketseat',
      'https://rocketseat.com.br',
      'example@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token ',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-session-token',
        in: 'header',
        description: 'Session token for user validation',
      },
      'Session-auth',
    )
    .addTag('Authentication', 'Endpoints para autenticação e autorização')
    .addTag('Users', 'Endpoints para gestão de usuários')
    .addTag('Products', 'Endpoints para catálogo de produtos')
    .addTag('Checkout', 'Endpoints para carrinho e pedidos')
    .addTag('Payments', 'Endpoints para processamento de pagamentos')
    .addTag('Health', 'Endpoints para verificação de saúde do sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(`API Gateway is running on: http://localhost:${port}`);
  // eslint-disable-next-line prettier/prettier
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}

void bootstrap();
