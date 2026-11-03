import { SCHEMA } from './schema.js';

const g = globalThis;

async function connect() {
  const url = process.env.DATABASE_URL;

  // Produção / banco real (Neon, Supabase, Vercel Postgres...)
  if (url) {
    const pg = (await import('pg')).default;
    const local = /(localhost|127\.0\.0\.1)/.test(url);
    const pool = new pg.Pool({
      connectionString: url,
      max: 3,
      ssl: local ? false : { rejectUnauthorized: false },
    });
    return {
      query: async (text, params = []) => (await pool.query(text, params)).rows,
      exec: (sql) => pool.query(sql),
    };
  }

  // Sem DATABASE_URL na Vercel os dados não persistiriam: avisa claramente.
  if (process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL não configurada. Adicione um banco Postgres ao projeto na Vercel (veja o README).'
    );
  }

  // Desenvolvimento local sem banco: Postgres embutido em memória.
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite(process.env.PGLITE_DIR || undefined);
  console.warn('[borali] DATABASE_URL ausente: usando banco temporário em memória (dados somem ao reiniciar).');
  return {
    query: async (text, params = []) => (await db.query(text, params)).rows,
    exec: (sql) => db.exec(sql),
  };
}

async function init() {
  const client = await connect();
  try {
    await client.exec(SCHEMA);
  } catch (e) {
    // Duas instâncias criando as tabelas ao mesmo tempo podem colidir: é inofensivo.
    if (!/already exists|duplicate key/i.test(String(e && e.message))) throw e;
  }
  return client;
}

export function getDb() {
  if (!g.__boraliDb) {
    g.__boraliDb = init().catch((e) => {
      g.__boraliDb = undefined;
      throw e;
    });
  }
  return g.__boraliDb;
}

export async function query(text, params) {
  const db = await getDb();
  return db.query(text, params);
}

export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] || null;
}
