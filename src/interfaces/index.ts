import { ClientProxy, ClientOptions, Closeable } from '@nestjs/microservices';

export interface IMicroServices {
  [serviceName: string]: ClientProxy & Closeable;
}

export interface IMicroServicesConfig {
  [key: string]: ClientOptions;
}
