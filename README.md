<!-- TOC -->
* [compass gateway](#compass-gateway)
  * [网关配置](#网关配置)
  * [模板特性](#模板特性)
    * [支持读取配置文件](#支持读取配置文件)
    * [Typescript/Jest/Airbnb Eslint/Prettier](#typescriptjestairbnb-eslintprettier)
    * [接口限流保护](#接口限流保护)
    * [约束接口进参,移除非白名单属性,自动转换数据为符合预期的类型](#约束接口进参移除非白名单属性自动转换数据为符合预期的类型)
    * [支持Swagger API文档](#支持swagger-api文档)
    * [基于Docker快速构建分发](#基于docker快速构建分发)
    * [默认提供Github Actions文件进行自动lint和部署](#默认提供github-actions文件进行自动lint和部署)
<!-- TOC -->

# compass gateway

Compass 网关服务

## 网关配置

网关配置读取启动路径下的 `micro-services.json` 文件,文件需要满足以下类型约束:

```typescript
import { ClientOptions } from '@nestjs/microservices';

export interface IMicroServicesConfig {
  [key: string]: ClientOptions;
}
```

例如:

```json
{
  "rbac": {
    "transport": 0,
    "options": {
      "port": 3002
    }
  }
}
```

生产部署时请挂载该配置文件进入容器内

## 模板特性

### 支持读取配置文件

```typescript
import { getEnvConfig } from '@app/common';

console.log('所有配置变量: ', getEnvConfig());
console.log('指定配置变量: ', getEnvConfig('NODE_ENV'));
```

配置文件默认读取程序执行目录下的.env文件,需要修改配置路径提供ENV_FILE_PATH环境变量即可, 内部取值: `process.env.ENV_FILE_PATH || path.join(process.cwd(), '.env')`

所有可用的环境变量请参考`libs/common/src/interfaces/environment.ts`文件内的 `EnvironmentVariablesDto` 类型定义说明

初始化的定义如下所示,具体请参考实际类型定义内容:

```typescript
export interface EnvironmentVariablesDto {
  /**
   * 环境变量
   * @default process.env.NODE_ENV | 'production'
   */
  NODE_ENV?: 'development' | 'production';
  /**
   * API节流间隔 毫秒单位
   * @default 60000
   */
  APP_THROTTLE_TTL?: number;
  /**
   * 节流间隔内的限制次数
   * @default 60
   */
  APP_THROTTLE_LIMIT?: number;
}
```

### Typescript/Jest/Airbnb Eslint/Prettier

* 支持Typescript环境
* `npm run format` 进行代码格式化
* `npm run lint` 进行代码检查,默认基于Airbnb规范
* `npm run test` 进行单元测试
* `npm run test:e2e` 进行端到端测试

### 接口限流保护

默认一个IP一个端点每分钟仅允许调用60次,特例场景可以通过装饰器跳过限流或局部修改限流,示例如下:

```typescript
@Controller('example')
export class ExampleController {
  // 该接口跳过节流保护
  @SkipThrottle()
  @Get('test')
  test(): string {
    return 'Hello world.';
  }

  // 该接口每分钟调用不超过3次
  @Throttle(3, 60)
  @Get('test2')
  test(): string {
    return 'Hello world.';
  }

  // 默认采用全局节流配置
  @Get('test3')
  test(): string {
    return 'Hello world.';
  }
}
```

要修改默认配置前往`src/app.module.ts`文件,通过.env配置文件修改以下配置

```dotenv
APP_THROTTLE_TTL=60000
APP_THROTTLE_LIMIT=60
```

### 约束接口进参,移除非白名单属性,自动转换数据为符合预期的类型

当遇见多个Dto联合类型时,内置ValidationPipe失效,可按照下列示例处理:

```typescript
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Body } from '@nestjs/common';
import { validateMultipleDto } from '@app/common';

class ADto {
  @IsString()
  id: string;
}

class BDto {
  @IsNumber()
  age: number;
}

class CDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string
}

@Controller('example')
export class ExampleController {
  @Get('test')
  test(@Body() body: ADto | BDto): string {
    // 验证失败会抛出异常终止程序,第三个参数AND,OR来控制处理逻辑,默认是OR逻辑
    validateMultipleDto(body, [ADto, BDto]);
    return 'Hello world.';
  }

  /**
   * @description 假如入参是 { name: 'test', test: 'test' }
   * 实际body会是 { name: 'test' }, test属性会被自动移除
   */
  @Get('test2')
  test2(@Body() body: CDto) {
    return 'Hello world.';
  }
}
```


### 支持Swagger API文档

`npm run start:dev` 或其他start启动项目后,访问/api/docs路径

### 基于Docker快速构建分发

`pnpm build` 构建产物

`docker build . -t <image_name>` 构建镜像

`docker run -d -p <port>:3000 --name <container_name> -v <env_file>:/root/compass-service/.env <image_name>` (-p,--name, -v均为可选参数,) 运行镜像,配置文件格式参考 EnvironmentVariablesDto 类型定义

### 默认提供Github Actions文件进行自动lint和部署

详情参考: `.github/workflows/deploy.yml`

在部署时需要变量和密钥如下所示:

* `vars.DOCKERHUB_USERNAME` Dockerhub 用户名
* `vars.DOCKERHUB_IMAGE_NAME` Dockerhub 镜像名
* `secrets.DOCKERHUB_TOKEN` Dockerhub api token

**供快速部署和参考使用** 如果该CI和部署地址非自己所要的可直接删除.github文件夹即可
