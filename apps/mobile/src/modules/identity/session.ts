import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { buildSyntheticEmail, parseMatricula } from '@si/core';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/**
 * Slug do tenant atual. Hardcoded no MVP (Fase 1.1 = 1 tenant unico).
 * Quando entrar Fase 2 (multi-tenant), virar config dinamica.
 */
export const TENANT_SLUG = 'portaria-modelo';

export type SessionState =
  | { status: 'loading' }
  | { status: 'authenticated'; session: Session }
  | { status: 'anonymous' };

/**
 * Hook que escuta o estado da sessao Supabase. Faz fetch inicial e ouve
 * mudancas via onAuthStateChange.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setState(
        data.session ? { status: 'authenticated', session: data.session } : { status: 'anonymous' },
      );
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }
      setState(session ? { status: 'authenticated', session } : { status: 'anonymous' });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export type SignInResult = { ok: true; session: Session } | { ok: false; error: string };

/**
 * Autentica colaborador de campo via matricula + PIN.
 * Constroi o email sintetico (ADR-0005) e usa signInWithPassword.
 */
export async function signInWithMatriculaPin({
  matricula,
  pin,
}: {
  matricula: string;
  pin: string;
}): Promise<SignInResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'App nao configurado. Avise o administrador (env vars do Supabase ausentes).',
    };
  }

  const cleanMatricula = parseMatricula(matricula);
  const email = buildSyntheticEmail({ matricula: cleanMatricula, tenantSlug: TENANT_SLUG });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });

  if (error || !data.session) {
    return { ok: false, error: 'Matricula ou PIN invalidos.' };
  }

  return { ok: true, session: data.session };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
