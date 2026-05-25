import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckinsFeed } from './CheckinsFeed';

export default function CheckinsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Check-ins</h1>
        <p className="text-sm text-neutral-500">
          Ultimos 50 check-ins. Atualiza automaticamente a cada 5 segundos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckinsFeed />
        </CardContent>
      </Card>
    </div>
  );
}
