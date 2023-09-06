import { parse } from 'yaml';
import * as fs from 'fs';
import { merge } from 'lodash';
import { Logger } from '@nestjs/common';
import { IEnvConfig } from '../interfaces';
import { resolve } from '../utils';

let configBuffer: string;

try {
  configBuffer = fs.readFileSync(resolve('config.yml'), { encoding: 'utf-8' });
} catch (e) {
  Logger.warn('配置文件读取失败', e);
}

const envConfig = merge({}, configBuffer ? parse(configBuffer) : undefined);

export function getEnv(): IEnvConfig {
  return envConfig;
}
