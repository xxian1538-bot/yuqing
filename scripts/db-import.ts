import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getMysqlConfig } from '../server/db';
import { loadEnv, projectRoot } from '../server/env';

loadEnv();

const config = getMysqlConfig();
const sqlFile = path.resolve(
  projectRoot,
  process.env.SQL_INIT_FILE || 'yuqing_backup_20260522.sql',
);

if (!existsSync(sqlFile)) {
  console.error(`SQL 文件不存在: ${sqlFile}`);
  console.error('请在 .env.local 中设置 SQL_INIT_FILE，或将备份文件放到项目根目录。');
  process.exit(1);
}

const mysqlArgs = [
  `-h${config.host}`,
  `-P${config.port}`,
  `-u${config.user}`,
  config.database,
];

if (config.password) {
  mysqlArgs.push(`-p${config.password}`);
}

console.log(`正在导入: ${sqlFile}`);
console.log(`目标库: ${config.user}@${config.host}:${config.port}/${config.database}`);

const result = spawnSync('mysql', mysqlArgs, {
  input: readFileSync(sqlFile),
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error('无法执行 mysql 命令，请确认 MySQL 客户端已安装并已加入 PATH。');
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('数据库导入完成。');
