import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-brand-900">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700" />

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-steel-600/40 bg-brand-800/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Sistema operacional ativo
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Sistema Integrado
            </h1>
            <p className="max-w-md text-base leading-relaxed text-steel-200">
              Plataforma de evidencia operacional para portaria, zeladoria e seguranca patrimonial.
              Registros imutaveis, supervisao em tempo real, conformidade trabalhista.
            </p>
            <div className="flex flex-wrap gap-6 pt-2 text-xs uppercase tracking-wider text-steel-300">
              <span>Check-in com QR</span>
              <span aria-hidden>·</span>
              <span>Auditoria imutavel</span>
              <span aria-hidden>·</span>
              <span>Operacao offline</span>
            </div>
          </div>

          <div className="rounded-xl border border-steel-700/40 bg-white p-8 shadow-2xl shadow-brand-900/40">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-500">
              Acesso restrito
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-900">
              Painel de comando
            </h2>
            <p className="mt-3 text-sm text-steel-600">
              Disponivel para administradores e supervisores operacionais.
            </p>
            <Link href="/login" className="mt-6 block">
              <Button size="lg" className="w-full">
                Entrar no painel
              </Button>
            </Link>
            <p className="mt-4 text-center text-xs text-steel-500">
              Diagnostico em{' '}
              <Link
                href="/health"
                className="font-medium text-brand-700 underline-offset-2 hover:underline"
              >
                /health
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-steel-700/40 bg-brand-900 px-6 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-steel-500">
        Sistema Integrado · operacional
      </footer>
    </main>
  );
}
