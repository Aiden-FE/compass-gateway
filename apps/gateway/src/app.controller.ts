import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  healthCheck() {
    return this.appService.pingAllServices();
  }

  /**
   * @todo
   * 1. 接收所有未捕获的请求
   * 2. 根据首位路径决定要调用的服务
   * 3. 不存在的服务返回404
   * 4. 转发请求给目标服务处理,携带其他路径信息,查询参数以及body请求体
   */
  dispatchTask() {}
}
