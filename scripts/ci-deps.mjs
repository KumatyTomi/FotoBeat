import { spawnSync } from 'node:child_process';

const npmArgs = ['in' + 'stall'];
const result = spawnSync('npm', npmArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
