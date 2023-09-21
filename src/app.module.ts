import { Logger, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getEnvConfig, resolve } from '@app/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxyFactory } from '@nestjs/microservices';
import { readFileSync } from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MICRO_SERVICES_PROVIDE_KEY } from './config';
import { IMicroServices, IMicroServicesConfig } from './interfaces';

@Module({
  imports: [
    // 局部可以通过 SkipThrottle Throttle 跳过或覆盖全局配置
    ThrottlerModule.forRoot([
      {
        // 单位毫秒
        ttl: getEnvConfig('APP_THROTTLE_TTL'),
        // 单位时间内限制的次数
        limit: getEnvConfig('APP_THROTTLE_LIMIT'),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: MICRO_SERVICES_PROVIDE_KEY,
      useFactory: () => {
        let microServicesConfig: IMicroServicesConfig = {};
        try {
          const config = readFileSync(resolve('micro-services.json')).toString();
          microServicesConfig = JSON.parse(config);
        } catch (e) {
          Logger.warn(
            '读取微服务配置发生异常,请确认程序启动路径下的 micro-services.json 文件是否正确,并满足类型 IMicroServicesConfig 约束',
            e,
          );
        }
        const microServices: IMicroServices = {};
        Object.keys(microServicesConfig).forEach((serviceName) => {
          const serviceOptions = microServicesConfig[serviceName];
          microServices[serviceName] = ClientProxyFactory.create(serviceOptions);
        });
        return microServices;
      },
      inject: [],
    },
  ],
})
export class AppModule {}
