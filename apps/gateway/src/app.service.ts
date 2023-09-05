import { Inject, Injectable } from '@nestjs/common';
import { IMicroServices } from '@shared/interfaces';
import { lastValueFrom } from 'rxjs';
import { MICRO_SERVICES_PROVIDE_KEY } from './config';

@Injectable()
export class AppService {
  constructor(@Inject(MICRO_SERVICES_PROVIDE_KEY) private readonly microService: IMicroServices) {}

  async pingAllServices() {
    const promiseAll: Promise<any>[] = [];
    Object.values(this.microService).forEach((service) => {
      promiseAll.push(lastValueFrom(service.emit({ cmd: 'ping' }, {})));
    });
    await Promise.all(promiseAll);
    return 'Services is ready';
  }
}
