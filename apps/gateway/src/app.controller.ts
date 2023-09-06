import { Controller, Delete, Get, Patch, Post, Put, Req, Res, HttpStatus } from '@nestjs/common';
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

  @Get('*')
  @Post('*')
  @Put('*')
  @Delete('*')
  @Patch('*')
  async dispatchTask(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const paths = req.url.split('/');
    const targetService = paths[1];
    const client = this.appService.getMicroServiceByName(targetService);
    if (!client) {
      return res.status(HttpStatus.NOT_FOUND).send('Not found service');
    }
    const cmd = `/${paths.slice(2, paths.length).join('/')}`;
    const result = await firstValueFrom(
      client.send(cmd, {
        query: req.query,
        body: req.body,
      }),
    );
    return res.status(HttpStatus.OK).send(result);
  }
}
