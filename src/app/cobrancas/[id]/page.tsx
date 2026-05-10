import { Shell, brDate, brl } from '@/components';
import { auth } from '@/lib/auth';
import { db, initDb } from '@/lib/db';
import PrintButton from './print-button';

export default async function CobrancaDetalhe({ params }: { params: Promise<{id:string}>}) {
  initDb();
  const session = await auth();
  const {id} = await params;
  const inv = db.prepare(`SELECT i.*, c.name as client_name, c.email as client_email, c.hourly_rate_cents
    FROM invoices i JOIN clients c ON c.id=i.client_id WHERE i.id=?`).get(id) as any;
  const rows = db.prepare(`SELECT te.work_date, te.description, te.hours
    FROM time_entries te WHERE te.client_id=? AND te.project_id=? AND te.work_date BETWEEN ? AND ? ORDER BY te.work_date ASC`).all(inv.client_id, inv.project_id, inv.period_start, inv.period_end) as any[];

  return <Shell><main className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow space-y-4 print:shadow-none">
    <h1 className="text-2xl font-bold">Nota fiscal simplificada</h1>
    <p><strong>Freelancer:</strong> {session?.user?.name ?? 'Freelancer Demo'}</p>
    <p><strong>Cliente:</strong> {inv.client_name} ({inv.client_email})</p>
    <p><strong>Período:</strong> {brDate.format(new Date(inv.period_start))} a {brDate.format(new Date(inv.period_end))}</p>
    <table className="w-full text-sm"><thead><tr className="border-b text-left"><th>Data</th><th>O que fez</th><th>Duração</th><th>Valor</th></tr></thead>
    <tbody>{rows.map((r,idx)=><tr key={idx} className="border-b"><td>{brDate.format(new Date(r.work_date))}</td><td>{r.description}</td><td>{r.hours.toFixed(2)}h</td><td>{brl.format((r.hours*inv.hourly_rate_cents)/100)}</td></tr>)}</tbody></table>
    <p className="text-xl font-bold text-right">Total: {brl.format(inv.total_cents/100)}</p>
    <div className="flex gap-2 print:hidden">
      <PrintButton />
      <form action={`/api/invoices/${id}/status`} method="post"><input type="hidden" name="status" value="enviada"/><button className="px-4 py-2 bg-emerald-600 text-white rounded">Marcar como enviada</button></form>
    </div>
  </main></Shell>;
}
