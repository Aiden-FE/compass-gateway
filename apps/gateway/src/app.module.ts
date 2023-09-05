import { Module } from '@nestjs/common';
import { getEnv } from '@shared';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { IMicroServices } from '@shared/interfaces';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MICRO_SERVICES_PROVIDE_KEY } from './config';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: MICRO_SERVICES_PROVIDE_KEY,
      useFactory: () => {
        const microServicesConfig = getEnv()?.microServices || {};
        const microServices: IMicroServices = {};
        Object.keys(microServicesConfig).forEach((serviceName) => {
          const serviceOptions = microServicesConfig[serviceName];
          switch (serviceOptions.transport) {
            case Transport.TCP:
            default:
              microServices[serviceName] = ClientProxyFactory.create({
                transport: Transport.TCP,
                options: {
                  host: serviceOptions.host,
                  port: serviceOptions.port,
                },
              });
              break;
          }
        });
        return microServices;
      },
      inject: [],
    },
  ],
})
export class AppModule {}
