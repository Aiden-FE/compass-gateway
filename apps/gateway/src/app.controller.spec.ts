import { Test, TestingModule } from '@nestjs/testing';
import { getEnv } from '@shared';
import { IMicroServices } from '@shared/interfaces';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { mockRequest, mockResponse } from 'mock-req-res';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MICRO_SERVICES_PROVIDE_KEY } from './config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Gateway root', () => {
    it('health check should return "ok"', async () => {
      expect(await appController.healthCheck()).toBe('ok');
    });

    it('should return "Not found service"', async () => {
      const req = mockRequest({
        headers: {
          host: 'localhost',
        },
        url: '/devops',
      });
      const res = mockResponse({
        send: (d) => d,
      });
      // @ts-ignore
      expect(await appController.dispatchTask(req, res)).toBe('Not found service');
    });
  });
});
