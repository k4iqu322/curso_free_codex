import { auth, signOut } from '@/lib/auth';
import { db, initDb } from '@/lib/db';
import { Shell } from '@/components';

export default async function DashboardPage() {
  const session = await auth();
  initDb();
  const totalClients = db.prepare('SELECT COUNT(*) as c FROM clients').get() as { c: number };
  const totalProjects = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
  const totalEntries = db.prepare('SELECT COUNT(*) as c FROM time_entries').get() as { c: number };

  return (
    <Shell><main className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Olá, {session?.user?.name ?? 'Freelancer'}!</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Clientes" value={totalClients.c} />
        <Card title="Projetos" value={totalProjects.c} />
        <Card title="Registros" value={totalEntries.c} />
      </div>
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
        <button className="rounded-lg bg-red-600 text-white px-4 py-2">Sair</button>
      </form>
    </main></Shell>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return <div className="bg-white shadow rounded-xl p-4"><p>{title}</p><p className="text-3xl font-bold">{value}</p></div>;
}
