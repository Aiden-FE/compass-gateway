import { HttpStatus } from '@nestjs/common';

export interface MicroServicesResponse {
  /** 响应内容 */
  response: unknown;
  /** 响应状态,默认OK */
  httpStatus?: HttpStatus;
}
