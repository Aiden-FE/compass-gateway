import { Controller,} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class RbacController {
  @MessagePattern({ cmd: 'ping' })
  healthCheck() {
    return 'ok';
  }
}
