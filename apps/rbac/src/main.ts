import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { RbacModule } from './rbac.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RbacModule, {
    transport: Transport.TCP,
    options: {
      port: 3010,
    },
  });
  app.listen().then(() => Logger.log('RBAC service is listening'));
}

bootstrap();
