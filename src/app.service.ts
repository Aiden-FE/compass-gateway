import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICRO_SERVICES_PROVIDE_KEY } from './config';
import { IMicroServices } from './interfaces';

@Injectable()
export class AppService {
  constructor(@Inject(MICRO_SERVICES_PROVIDE_KEY) private readonly microService: IMicroServices) {}

  async pingAllServices() {
    const promiseAll: Promise<any>[] = [];
    Object.values(this.microService).forEach((service) => {
      if (service) {
        promiseAll.push(
          firstValueFrom(
            service.send(
              {
                url: '/ping',
                method: 'GET',
              },
              {},
            ),
          ),
        );
      }
    });
    await Promise.all(promiseAll);
    return 'ok';
  }

  getMicroServiceByName(serviceName: string) {
    return this.microService[serviceName];
  }
}
