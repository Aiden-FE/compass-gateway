# compass-gateway
> Compass 网关服务

## 快速上手

`pnpm install` 恢复依赖

`pnpm dev` 启动开发模式

`pnpm start:prod` 启动生产模式

`pnpm build` 构建产物

`pnpm format` 格式化文件

`pnpm lint` 代码检查

`pnpm test` 单元测试

`pnpm test:e2e` 端到端测试

## 本地构建镜像

`pnpm build` 构建产物

`docker build . -t <image_name>` 构建镜像

`docker run -d -p <port>:3000 --name compass-gateway -v <config_yaml_file>:/root/compass-gateway/config.prod.yml <image_name>` 运行镜像,配置文件格式参考 config.example.yml 文件说明
