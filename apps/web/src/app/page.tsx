import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
          Sprint 1 — Fundação técnica
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-brand-800">Sistema Integrado</h1>
        <p className="max-w-md text-neutral-500">
          Plataforma de evidência operacional para empresas de portaria. Painel administrativo em
          construção.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Status do ambiente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600">
          <p>
            Verifique a conexão com o banco de dados em{' '}
            <Link
              href="/health"
              className="font-medium text-brand-600 underline underline-offset-2"
            >
              /health
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
