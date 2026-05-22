import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

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
      message: 'Variáveis de ambiente do Supabase não configuradas. Veja apps/web/.env.example.',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('tenants').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Erro ao consultar o banco: ${error.message}` };
    }
    return { ok: true, message: 'Conexão com o banco de dados OK.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return { ok: false, message: `Falha de conexão: ${message}` };
  }
}

export default async function HealthPage() {
  const result = await checkDatabase();

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Health check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-block h-3 w-3 rounded-full',
                result.ok ? 'bg-green-500' : 'bg-red-500',
              )}
            />
            <span className="text-sm font-medium">{result.ok ? 'OK' : 'Erro'}</span>
          </div>
          <p className="mt-3 text-sm text-neutral-600">{result.message}</p>
        </CardContent>
      </Card>
    </main>
  );
}
