import { Pool, type PoolConfig } from 'pg';
import { loadLocalEnv } from './env';

loadLocalEnv();

interface ParsedConnection {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

function parseBracketedConnectionString(connectionString: string): ParsedConnection | null {
  const match = connectionString.match(/^postgresql:\/\/([^:]+):\[(.*)\]@([^:/]+):(\d+)\/(.+)$/);

  if (!match) {
    return null;
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: Number(match[4]),
    database: match[5],
  };
}

function getPoolConfig(): PoolConfig {
  const bracketed = process.env.DATABASE_URL ? parseBracketedConnectionString(process.env.DATABASE_URL) : null;

  if (bracketed) {
    return {
      host: bracketed.host,
      port: bracketed.port,
      database: bracketed.database,
      user: bracketed.user,
      password: bracketed.password,
      ssl: { rejectUnauthorized: false },
    };
  }

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }

  if (
    process.env.SUPABASE_DB_HOST &&
    process.env.SUPABASE_DB_PORT &&
    process.env.SUPABASE_DB_NAME &&
    process.env.SUPABASE_DB_USER &&
    process.env.SUPABASE_DB_PASSWORD
  ) {
    return {
      host: process.env.SUPABASE_DB_HOST,
      port: Number(process.env.SUPABASE_DB_PORT),
      database: process.env.SUPABASE_DB_NAME,
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    };
  }

  throw new Error('Missing Supabase database configuration');
}

export const pool = new Pool(getPoolConfig());

export async function ensureSchema() {
  await pool.query(`
    create table if not exists app_records (
      collection text not null,
      id text not null,
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (collection, id)
    )
  `);

  await pool.query(`
    create index if not exists idx_app_records_collection_updated_at
    on app_records (collection, updated_at desc)
  `);
}

export async function listCollection<T>(collection: string): Promise<T[]> {
  const result = await pool.query<{ data: T }>(
    'select data from app_records where collection = $1 order by updated_at desc, id asc',
    [collection],
  );
  return result.rows.map((row) => row.data);
}

export async function countCollection(collection: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'select count(*)::text as count from app_records where collection = $1',
    [collection],
  );
  return Number(result.rows[0]?.count || 0);
}

export async function upsertRecord(collection: string, id: string, data: unknown) {
  await pool.query(
    `
      insert into app_records (collection, id, data)
      values ($1, $2, $3::jsonb)
      on conflict (collection, id)
      do update set
        data = excluded.data,
        updated_at = now()
    `,
    [collection, id, JSON.stringify(data)],
  );
}

export async function upsertMany(collection: string, items: Array<{ id: string; data: unknown }>) {
  if (items.length === 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    for (const item of items) {
      await client.query(
        `
          insert into app_records (collection, id, data)
          values ($1, $2, $3::jsonb)
          on conflict (collection, id)
          do update set
            data = excluded.data,
            updated_at = now()
        `,
        [collection, item.id, JSON.stringify(item.data)],
      );
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteRecord(collection: string, id: string) {
  await pool.query('delete from app_records where collection = $1 and id = $2', [collection, id]);
}
