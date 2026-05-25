'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type LoginState = { error: string } | null;

export async function signInAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/app');

  if (!email || !password) {
    return { error: 'Preencha email e senha.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Email ou senha invalidos.' };
  }

  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
