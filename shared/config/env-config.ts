import { parse } from 'yaml';
import * as fs from 'fs';
import { merge } from 'lodash';
import { IEnvConfig } from '../interfaces';
import { resolve } from '../utils';

const envConfig = merge({}, parse(fs.readFileSync(resolve('config.yml'), { encoding: 'utf-8' })));

export function getEnv(): IEnvConfig {
  return envConfig;
}
