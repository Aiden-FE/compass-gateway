import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/ping (GET)', () => {
    return request(app.getHttpServer()).get('/ping').expect(200).expect('ok');
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404).expect('Not found service');
  });

  it('/ (POST)', () => {
    return request(app.getHttpServer()).post('/').expect(404).expect('Not found service');
  });

  it('/ (DELETE)', () => {
    return request(app.getHttpServer()).delete('/').expect(404).expect('Not found service');
  });

  it('/ (PUT)', () => {
    return request(app.getHttpServer()).put('/').expect(404).expect('Not found service');
  });

  it('/ (PATCH)', () => {
    return request(app.getHttpServer()).patch('/').expect(404).expect('Not found service');
  });

  it('/test/hi (POST)', () => {
    return request(app.getHttpServer()).post('/test/hi').expect(404).expect('Not found service');
  });
});
