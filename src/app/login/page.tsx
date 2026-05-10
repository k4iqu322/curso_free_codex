import { signIn } from '@/lib/auth';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Entrar no FreelaDash</h1>
        <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/dashboard' }); }}>
          <button className="w-full rounded-lg bg-slate-900 text-white py-3">Entrar com Google</button>
        </form>
        <form className="space-y-3" action={async (formData) => {
          'use server';
          await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/dashboard'
          });
        }}>
          <input name="email" type="email" placeholder="Email" className="w-full border rounded-lg p-3" required />
          <input name="password" type="password" placeholder="Senha" className="w-full border rounded-lg p-3" required />
          <button className="w-full rounded-lg bg-emerald-600 text-white py-3">Entrar com email/senha</button>
        </form>
      </div>
    </main>
  );
}
