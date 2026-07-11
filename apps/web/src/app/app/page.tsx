import Link from 'next/link';
import { MonitorDashboard } from './MonitorDashboard';

export default function AppHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-500">
            Supervisor eletronico
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-brand-900">Monitoramento</h1>
          <p className="max-w-2xl text-sm text-steel-600">
            Plantoes, ocorrencias e alertas em tempo real. Atualiza a cada 5 segundos.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Link
            href="/app/postos"
            className="rounded-md border border-steel-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-steel-600 transition hover:border-brand-500 hover:text-brand-900"
          >
            Postos
          </Link>
          <Link
            href="/app/checkins"
            className="rounded-md border border-steel-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-steel-600 transition hover:border-brand-500 hover:text-brand-900"
          >
            Check-ins
          </Link>
        </div>
      </div>

      <MonitorDashboard />
    </div>
  );
}
