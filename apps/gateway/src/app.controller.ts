import { Controller, Get, Req, Res, HttpStatus, All } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { firstValueFrom } from 'rxjs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  healthCheck() {
    return this.appService.pingAllServices();
  }

  @All('*')
  async dispatchTask(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const paths = req.url.split('/');
    const targetService = paths[1];
    const client = this.appService.getMicroServiceByName(targetService);
    if (!client) {
      return res.status(HttpStatus.NOT_FOUND).send('Not found service');
    }
    const url = `/${paths.slice(2, paths.length).join('/')}`;
    const result = await firstValueFrom(
      client.send(
        {
          url,
          method: req.method,
        },
        {
          query: req.query,
          body: req.body,
        },
      ),
    );
    return res.status(HttpStatus.OK).send(result);
  }
}
