import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOutAction } from '../(auth)/login/actions';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  field_worker: 'Operador',
  authenticated: 'Acesso autorizado',
};

export function AppShell({
  fullName,
  role,
  children,
}: {
  fullName: string;
  role: string;
  children: ReactNode;
}) {
  const roleLabel = ROLE_LABEL[role] ?? role;
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex min-h-screen flex-col bg-steel-50">
      <header className="border-b border-brand-800 bg-brand-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/app" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-steel-700/50 bg-brand-800 text-xs font-bold tracking-tight">
                SI
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-400">
                  Sistema Integrado
                </p>
                <p className="text-sm font-semibold tracking-tight text-white">
                  Painel operacional
                </p>
              </div>
            </Link>
            <nav className="hidden gap-1 md:flex">
              <NavLink href="/app">Visao geral</NavLink>
              <NavLink href="/app/postos">Postos</NavLink>
              <NavLink href="/app/checkins">Check-ins</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-white">{fullName}</p>
              <p className="text-[10px] uppercase tracking-wider text-steel-400">{roleLabel}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-steel-700 text-xs font-semibold text-white">
              {initials || '·'}
            </span>
            <form action={signOutAction}>
              <Button
                type="submit"
                size="sm"
                className="border-steel-600 bg-transparent text-white hover:bg-brand-800"
              >
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-steel-300 transition-colors hover:bg-brand-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
