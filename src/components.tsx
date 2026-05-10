import Link from 'next/link';

export function Sidebar() {
  const items = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/timer', label: 'Timer' },
    { href: '/clientes', label: 'Clientes' },
    { href: '/cobrancas', label: 'Cobranças' }
  ];
  return <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 fixed left-0 top-0 hidden md:block">
    <h2 className="text-xl font-bold mb-8">FreelaDash</h2>
    <nav className="space-y-3">{items.map(i=><Link key={i.href} href={i.href} className="block px-3 py-2 rounded hover:bg-slate-800">{i.label}</Link>)}</nav>
  </aside>;
}

export function Shell({children}:{children:React.ReactNode}){return <div><Sidebar/><div className="md:ml-64 p-6">{children}</div></div>}

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const brDate = new Intl.DateTimeFormat('pt-BR');
