import * as path from 'path';
import * as process from 'process';

export function resolve(...pathStr: string[]) {
  return path.join(process.cwd(), ...pathStr);
}
