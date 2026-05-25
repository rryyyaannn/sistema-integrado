import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listPosts } from '@/modules/catalog/posts.repo';
import Link from 'next/link';

const SERVICE_TYPE_LABEL: Record<string, string> = {
  portaria: 'Portaria',
  servicos_gerais: 'Servicos gerais',
  tecnico: 'Tecnico',
  monitoramento: 'Monitoramento',
};

export default async function PostosPage() {
  const posts = await listPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-500">
          Cadastro operacional
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Postos</h1>
        <p className="text-sm text-steel-600">
          {posts.length} {posts.length === 1 ? 'posto cadastrado' : 'postos cadastrados'}.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-steel-200 bg-white shadow-sm shadow-brand-900/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-steel-500">
                  Nenhum posto cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-semibold tracking-tight text-brand-900">{post.name}</div>
                    {post.address ? (
                      <div className="mt-0.5 text-xs text-steel-500">{post.address}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-steel-700">{post.client_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-sm bg-steel-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-steel-700">
                      {SERVICE_TYPE_LABEL[post.service_type] ?? post.service_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {post.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-steel-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-steel-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-steel-400" />
                        Pausado
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/app/postos/${post.id}/qr`}>
                      <Button variant="outline" size="sm">
                        Ver QR
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
