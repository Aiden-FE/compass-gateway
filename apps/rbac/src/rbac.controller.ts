import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class RbacController {
  @MessagePattern('/ping')
  healthCheck() {
    return 'ok';
  }

  @MessagePattern('/test')
  test() {
    return 'test';
  }
}
