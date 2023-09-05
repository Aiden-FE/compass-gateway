import { ClientProxy, Closeable, Transport } from '@nestjs/microservices';

export interface IMicroServiceTCP {
  transport?: Transport;
  host?: string;
  port: number;
}

export interface IMicroServices {
  [serviceName: string]: ClientProxy & Closeable;
}

export interface IEnvConfig {
  microServices: { [key: string]: IMicroServiceTCP };
}
