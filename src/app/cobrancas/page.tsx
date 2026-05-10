import Link from 'next/link';
import { Shell, brDate, brl } from '@/components';
import { db, initDb } from '@/lib/db';

export default async function CobrancasPage() {
  initDb();
  const clients = db.prepare('SELECT id,name FROM clients ORDER BY name').all() as Array<{id:string;name:string}>;
  const projects = db.prepare('SELECT id,name,client_id FROM projects ORDER BY name').all() as Array<{id:string;name:string;client_id:string}>;
  const invoices = db.prepare(`SELECT i.id,i.period_start,i.period_end,i.status,i.total_cents,c.name as client_name
    FROM invoices i JOIN clients c ON c.id=i.client_id ORDER BY i.created_at DESC`).all() as any[];

  return <Shell><main className="space-y-6">
    <h1 className="text-3xl font-bold">Cobranças</h1>
    <form action="/api/invoices" method="post" className="bg-white rounded-xl p-4 shadow grid md:grid-cols-5 gap-2">
      <select name="clientId" className="border rounded p-2" required>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select name="projectId" className="border rounded p-2" required>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input type="date" name="periodStart" className="border rounded p-2" required />
      <input type="date" name="periodEnd" className="border rounded p-2" required />
      <button className="bg-emerald-600 text-white rounded p-2">Gerar cobrança</button>
    </form>

    <div className="bg-white rounded-xl p-4 shadow overflow-x-auto">
      <table className="w-full text-sm"><thead><tr className="border-b text-left"><th>Cliente</th><th>Período</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>{invoices.map(i=><tr key={i.id} className="border-b"><td>{i.client_name}</td><td>{brDate.format(new Date(i.period_start))} a {brDate.format(new Date(i.period_end))}</td><td>{brl.format(i.total_cents/100)}</td><td>
      <form action={`/api/invoices/${i.id}/status`} method="post" className="flex gap-2 items-center"><select name="status" defaultValue={i.status} className="border rounded p-1"><option>rascunho</option><option>enviada</option><option>paga</option></select><button>Salvar</button></form>
      </td><td><Link className="text-emerald-700" href={`/cobrancas/${i.id}`}>Ver</Link></td></tr>)}</tbody></table>
    </div>
  </main></Shell>;
}
