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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Postos</h1>
        <p className="text-sm text-neutral-500">
          {posts.length} {posts.length === 1 ? 'posto' : 'postos'} cadastrados.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
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
                <TableCell colSpan={5} className="text-center text-sm text-neutral-500">
                  Nenhum posto cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium text-neutral-900">{post.name}</div>
                    {post.address ? (
                      <div className="text-xs text-neutral-500">{post.address}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-700">{post.client_name}</TableCell>
                  <TableCell className="text-sm text-neutral-700">
                    {SERVICE_TYPE_LABEL[post.service_type] ?? post.service_type}
                  </TableCell>
                  <TableCell>
                    {post.active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
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
