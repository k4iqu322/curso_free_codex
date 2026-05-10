import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, initDb } from '@/lib/db';

const schema = z.object({ status: z.enum(['rascunho', 'enviada', 'paga']) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  initDb();
  const raw = Object.fromEntries((await request.formData()).entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(parsed.data.status, (await params).id);
  return NextResponse.redirect(request.headers.get('referer') || new URL('/cobrancas', request.url));
}
