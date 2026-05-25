import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? '/app';

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-900 p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700" />

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-400">
            Sistema Integrado
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Painel de comando</h1>
        </div>

        <div className="rounded-xl border border-steel-700/40 bg-white p-7 shadow-2xl shadow-brand-900/40">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-500">
            Autenticacao
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-brand-900">Entrar</h2>
          <p className="mt-1 text-sm text-steel-600">
            Use seu email e senha de administrador ou supervisor.
          </p>
          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-steel-500">
          Operacao restrita · acessos auditados
        </p>
      </div>
    </main>
  );
}
