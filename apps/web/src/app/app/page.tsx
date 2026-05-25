import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AppHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Painel</h1>
        <p className="text-sm text-neutral-500">
          Visao geral. Use o menu para navegar entre postos e check-ins.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/app/postos">
          <Card className="transition hover:border-brand-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Postos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-600">
              <p>Listar postos e gerar QR Code para check-in.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/checkins">
          <Card className="transition hover:border-brand-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-600">
              <p>Ultimos check-ins recebidos do app de campo.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
