import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

const db = new Database('prisma/freeladash.db');

db.exec(`
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT,google_id TEXT UNIQUE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,name TEXT NOT NULL,email TEXT,hourly_rate_cents INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY,client_id TEXT NOT NULL,name TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('ativo','concluido')),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS time_entries (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,client_id TEXT NOT NULL,project_id TEXT NOT NULL,work_date TEXT NOT NULL,hours REAL NOT NULL,description TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE,FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,client_id TEXT NOT NULL,period_start TEXT NOT NULL,period_end TEXT NOT NULL,total_cents INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('pendente','paga','cancelada')),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE);
`);

for (const table of ['invoices','time_entries','projects','clients','users']) db.prepare(`DELETE FROM ${table}`).run();
const userId = 'user-demo';
db.prepare('INSERT INTO users (id,name,email,password_hash) VALUES (?,?,?,?)').run(userId,'Freelancer Demo','demo@freeladash.com','123456');
const clients = [
  { id: randomUUID(), name: 'Loja Aurora', email: 'contato@aurora.com', rate: 12000 },
  { id: randomUUID(), name: 'Clínica Vida', email: 'ti@clinicavida.com', rate: 18000 },
  { id: randomUUID(), name: 'Agência Pixel', email: 'jobs@pixel.com', rate: 15000 }
];
for (const c of clients) db.prepare('INSERT INTO clients (id,user_id,name,email,hourly_rate_cents) VALUES (?,?,?,?,?)').run(c.id,userId,c.name,c.email,c.rate);
const projects = [
  { name: 'Site institucional', clientId: clients[0].id, status: 'ativo' },
  { name: 'Landing campanha', clientId: clients[0].id, status: 'concluido' },
  { name: 'Portal pacientes', clientId: clients[1].id, status: 'ativo' },
  { name: 'App financeiro', clientId: clients[2].id, status: 'ativo' },
  { name: 'Painel analytics', clientId: clients[2].id, status: 'concluido' }
].map(p => ({ ...p, id: randomUUID() }));
for (const p of projects) db.prepare('INSERT INTO projects (id,client_id,name,status) VALUES (?,?,?,?)').run(p.id,p.clientId,p.name,p.status);
for (let i=0;i<20;i++) {
  const p = projects[i % projects.length];
  const daysAgo = Math.floor(Math.random()*30);
  const date = new Date();
  date.setUTCDate(date.getUTCDate()-daysAgo);
  const workDate = date.toISOString().slice(0,10);
  const hours = [1.5,2,2.5,3,4][i%5];
  db.prepare('INSERT INTO time_entries (id,user_id,client_id,project_id,work_date,hours,description) VALUES (?,?,?,?,?,?,?)')
    .run(randomUUID(),userId,p.clientId,p.id,workDate,hours,`Atividade ${i+1} no projeto ${p.name}`);
}
console.log('Seed concluído com sucesso.');
