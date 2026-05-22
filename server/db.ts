import mysql, { type Pool, type PoolOptions, type RowDataPacket } from 'mysql2/promise';
import { loadLocalEnv } from './env';

loadLocalEnv();

interface MysqlConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface AppRecordRow extends RowDataPacket {
  data: unknown;
}

interface CountRow extends RowDataPacket {
  count: number;
}

let pool: Pool | null = null;

function parseMysqlConnectionString(connectionString: string): MysqlConfig | null {
  try {
    const url = new URL(connectionString);

    if (!['mysql:', 'mysql2:'].includes(url.protocol)) {
      return null;
    }

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      database: url.pathname.replace(/^\//, '') || 'yuqing',
      user: decodeURIComponent(url.username || 'root'),
      password: decodeURIComponent(url.password || ''),
    };
  } catch {
    return null;
  }
}

function getMysqlConfig(): MysqlConfig {
  const fromUrl = process.env.MYSQL_URL ? parseMysqlConnectionString(process.env.MYSQL_URL) : null;

  if (fromUrl) {
    return fromUrl;
  }

  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || 'yuqing',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
  };
}

function getPoolOptions(config: MysqlConfig, includeDatabase: boolean): PoolOptions {
  return {
    host: config.host,
    port: config.port,
    database: includeDatabase ? config.database : undefined,
    user: config.user,
    password: config.password,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    timezone: 'Z',
  };
}

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replace(/`/g, '``')}\``;
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool(getPoolOptions(getMysqlConfig(), true));
  }

  return pool;
}

function normalizeJson<T>(value: unknown): T {
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }

  return value as T;
}

export async function ensureSchema() {
  const config = getMysqlConfig();
  const adminPool = mysql.createPool(getPoolOptions(config, false));

  try {
    await adminPool.query(`create database if not exists ${quoteIdentifier(config.database)} character set utf8mb4 collate utf8mb4_unicode_ci`);
  } finally {
    await adminPool.end();
  }

  await getPool().query(`
    create table if not exists app_records (
      collection varchar(100) not null,
      id varchar(100) not null,
      data json not null,
      created_at timestamp not null default current_timestamp,
      updated_at timestamp not null default current_timestamp on update current_timestamp,
      primary key (collection, id),
      index idx_app_records_collection_updated_at (collection, updated_at)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci
  `);
}

export async function listCollection<T>(collection: string): Promise<T[]> {
  const [rows] = await getPool().query<AppRecordRow[]>(
    'select data from app_records where collection = ? order by updated_at desc, id asc',
    [collection],
  );

  return rows.map((row) => normalizeJson<T>(row.data));
}

export async function countCollection(collection: string): Promise<number> {
  const [rows] = await getPool().query<CountRow[]>('select count(*) as count from app_records where collection = ?', [collection]);
  return Number(rows[0]?.count || 0);
}

export async function upsertRecord(collection: string, id: string, data: unknown) {
  await getPool().query(
    `
      insert into app_records (collection, id, data)
      values (?, ?, cast(? as json))
      on duplicate key update
        data = values(data),
        updated_at = current_timestamp
    `,
    [collection, id, JSON.stringify(data)],
  );
}

export async function upsertMany(collection: string, items: Array<{ id: string; data: unknown }>) {
  if (items.length === 0) {
    return;
  }

  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      await connection.query(
        `
          insert into app_records (collection, id, data)
          values (?, ?, cast(? as json))
          on duplicate key update
            data = values(data),
            updated_at = current_timestamp
        `,
        [collection, item.id, JSON.stringify(item.data)],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteRecord(collection: string, id: string) {
  await getPool().query('delete from app_records where collection = ? and id = ?', [collection, id]);
}
