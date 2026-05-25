import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const TILES = [
  {
    href: '/app/postos',
    title: 'Postos',
    description: 'Cadastro de postos e geracao de QR Code para check-in.',
    meta: 'Operacional',
  },
  {
    href: '/app/checkins',
    title: 'Check-ins',
    description: 'Ultimos check-ins do app de campo, atualizados em tempo real.',
    meta: 'Tempo real',
  },
];

export default function AppHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-500">
          Visao geral
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Painel</h1>
        <p className="max-w-2xl text-sm text-steel-600">
          Operacao em andamento. Selecione um modulo abaixo para abrir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group">
            <Card className="h-full transition hover:border-brand-500 hover:shadow-md hover:shadow-brand-900/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tile.title}</CardTitle>
                  <span className="text-[10px] uppercase tracking-wider text-steel-500">
                    {tile.meta}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-steel-700">
                <p>{tile.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-brand-700 group-hover:text-brand-900">
                  Abrir →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
