import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOutAction } from '../(auth)/login/actions';

export function AppShell({
  fullName,
  role,
  children,
}: {
  fullName: string;
  role: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/app" className="text-lg font-semibold text-brand-800">
              Sistema Integrado
            </Link>
            <nav className="flex gap-4 text-sm text-neutral-600">
              <Link href="/app/postos" className="hover:text-brand-600">
                Postos
              </Link>
              <Link href="/app/checkins" className="hover:text-brand-600">
                Check-ins
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-medium text-neutral-800">{fullName}</p>
              <p className="text-xs text-neutral-500">{role}</p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
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
