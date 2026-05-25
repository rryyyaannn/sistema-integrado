import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckinsFeed } from './CheckinsFeed';

export default function CheckinsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-500">
          Operacao em curso
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Check-ins</h1>
        <p className="text-sm text-steel-600">
          Ultimos 50 check-ins. Atualiza automaticamente a cada 5 segundos.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recebidos</CardTitle>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Ao vivo
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CheckinsFeed />
        </CardContent>
      </Card>
    </div>
  );
}
