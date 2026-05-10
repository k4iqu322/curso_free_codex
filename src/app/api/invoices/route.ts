import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, initDb } from '@/lib/db';

const schema = z.object({ clientId: z.string().min(1), projectId: z.string().min(1), periodStart: z.string().min(10), periodEnd: z.string().min(10) });

export async function POST(request: Request) {
  initDb();
  const raw = Object.fromEntries((await request.formData()).entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const c = db.prepare('SELECT hourly_rate_cents FROM clients WHERE id = ?').get(parsed.data.clientId) as { hourly_rate_cents: number };
  const sum = db.prepare(`SELECT COALESCE(SUM(hours),0) as h FROM time_entries WHERE client_id=? AND project_id=? AND work_date BETWEEN ? AND ?`).get(parsed.data.clientId, parsed.data.projectId, parsed.data.periodStart, parsed.data.periodEnd) as {h:number};
  const id = `${Date.now()}-inv`;
  db.prepare(`INSERT INTO invoices (id,user_id,client_id,project_id,period_start,period_end,total_cents,status)
    VALUES (?,?,?,?,?,?,?,?)`).run(id, 'user-demo', parsed.data.clientId, parsed.data.projectId, parsed.data.periodStart, parsed.data.periodEnd, Math.round(sum.h * c.hourly_rate_cents), 'rascunho');
  return NextResponse.redirect(new URL('/cobrancas', request.url));
}
