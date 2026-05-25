import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

// Roda a cada request (nunca no build), entao nunca consulta o banco no CI.
export const dynamic = 'force-dynamic';

type HealthResult = {
  ok: boolean;
  message: string;
};

async function checkDatabase(): Promise<HealthResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Variaveis de ambiente do Supabase nao configuradas. Veja apps/web/.env.example.',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('tenants').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Erro ao consultar o banco: ${error.message}` };
    }
    return { ok: true, message: 'Conexao com o banco de dados OK.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return { ok: false, message: `Falha de conexao: ${message}` };
  }
}

export default async function HealthPage() {
  const result = await checkDatabase();

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-900 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Health check</CardTitle>
          <p className="text-xs text-steel-500">Diagnostico de conectividade</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span
              className={[
                'inline-block h-2.5 w-2.5 rounded-full',
                result.ok ? 'bg-emerald-500' : 'bg-red-500',
              ].join(' ')}
            />
            <span className="text-sm font-semibold tracking-tight text-brand-900">
              {result.ok ? 'Operacional' : 'Erro'}
            </span>
          </div>
          <p className="mt-3 text-sm text-steel-600">{result.message}</p>
        </CardContent>
      </Card>
    </main>
  );
}
