import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'freeladash.db');
export const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      hourly_rate_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('ativo','concluido')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      work_date TEXT NOT NULL,
      hours REAL NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      project_id TEXT,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('rascunho','enviada','paga')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
  `);

  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='invoices'").get() as { sql: string };
  if (schema?.sql?.includes("'pendente','paga','cancelada'")) {
    db.exec(`
      ALTER TABLE invoices RENAME TO invoices_old;
      CREATE TABLE invoices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        project_id TEXT,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        total_cents INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('rascunho','enviada','paga')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
      );
      INSERT INTO invoices (id,user_id,client_id,project_id,period_start,period_end,total_cents,status,created_at)
      SELECT id,user_id,client_id,project_id,period_start,period_end,total_cents,
      CASE status WHEN 'pendente' THEN 'rascunho' WHEN 'cancelada' THEN 'rascunho' ELSE status END,
      created_at FROM invoices_old;
      DROP TABLE invoices_old;
    `);
  }

  const cols = db.prepare('PRAGMA table_info(invoices)').all() as Array<{ name: string }>;
  if (!cols.find((c) => c.name === 'project_id')) db.exec('ALTER TABLE invoices ADD COLUMN project_id TEXT');
}
