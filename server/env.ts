import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, '..');

const envFiles = ['.env', '.env.local'];

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1).trim());

    // 容器注入的环境变量优先，文件仅补充未设置的项（本地开发用）
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/** Load `.env` then `.env.local` (does not override existing process.env). */
export function loadEnv() {
  if (process.env.SKIP_ENV_FILES === 'true') {
    return;
  }

  for (const fileName of envFiles) {
    loadEnvFile(path.join(projectRoot, fileName));
  }
}

/** @deprecated Use `loadEnv` */
export function loadLocalEnv() {
  loadEnv();
}
