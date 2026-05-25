import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from './AppShell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // O middleware ja redireciona; este check defende contra request direto.
  if (!user) {
    redirect('/login');
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Usuario';
  const role = (user.user_metadata?.role as string | undefined) ?? 'authenticated';

  return (
    <AppShell fullName={fullName} role={role}>
      {children}
    </AppShell>
  );
}
