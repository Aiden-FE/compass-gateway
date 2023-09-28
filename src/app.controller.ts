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
      return res.status(HttpStatus.NOT_FOUND).send({
        statusCode: 100404,
        data: null,
        message: 'Not found service',
      });
    }
    const url = `/${paths.slice(2, paths.length).join('/')}`;
    let result: MicroServicesResponse;
    try {
      let user: any = null;
      if (req.headers?.authorization) {
        const rbacClient = this.appService.getMicroServiceByName('rbac');
        if (rbacClient) {
          const resp = await firstValueFrom(
            rbacClient.send(
              { url: '/oauth/user-info', method: 'GET' },
              {
                headers: req.headers,
                query: req.query,
                body: req.body,
                ip: req.ip,
                ips: req.ips,
              },
            ),
          );
          if (resp.response?.statusCode === 100200) {
            user = resp.response.data;
          }
        }
      }
      result = await firstValueFrom(
        client.send(
          {
            url,
            method: req.method.toLocaleUpperCase(),
          },
          {
            headers: req.headers,
            query: req.query,
            body: req.body,
            ip: req.ip,
            ips: req.ips,
            user,
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
