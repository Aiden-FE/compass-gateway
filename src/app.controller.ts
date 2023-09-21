import { All, Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { firstValueFrom } from 'rxjs';
import { MicroServicesResponse } from '@app/common';
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
    const reqUrl = new URL(`${req.protocol}://${req.hostname}${req.url}`);
    const paths = reqUrl.pathname.split('/');
    const targetService = paths[1];
    const client = this.appService.getMicroServiceByName(targetService);
    if (!client) {
      return res.status(HttpStatus.NOT_FOUND).send('Not found service');
    }
    const url = `/${paths.slice(2, paths.length).join('/')}`;
    let result: MicroServicesResponse;
    try {
      result = await firstValueFrom(
        client.send(
          {
            url,
            method: req.method,
          },
          {
            headers: req.headers,
            query: req.query,
            body: req.body,
            ip: req.ip,
            ips: req.ips,
          },
        ),
      );
    } catch (e) {
      if (e?.httpStatus) {
        return res.status(e.httpStatus).send(e.response);
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e);
    }

    if (result?.httpStatus) {
      return res.status(result.httpStatus).send(result.response);
    }
    return res.status(HttpStatus.OK).send(result);
  }
}
