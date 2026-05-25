import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPost } from '@/modules/catalog/posts.repo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QrCodeView } from './QrCodeView';

export default async function PostoQrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{post.name}</h1>
          <p className="text-sm text-neutral-500">
            {post.client_name}
            {post.address ? ` — ${post.address}` : ''}
          </p>
        </div>
        <Link href="/app/postos">
          <Button variant="outline" size="sm">
            Voltar
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>QR Code do posto</CardTitle>
          <p className="text-sm text-neutral-500">
            Imprima e fixe no posto. O colaborador escaneia no app de campo para abrir o formulario
            de check-in.
          </p>
        </CardHeader>
        <CardContent>
          <QrCodeView token={post.qr_code_token} />
          <p className="mt-4 break-all rounded-md bg-neutral-100 p-3 font-mono text-xs text-neutral-700">
            {post.qr_code_token}
          </p>
          {post.qr_code_rotated_at ? (
            <p className="mt-2 text-xs text-neutral-500">
              Token rotacionado em {new Date(post.qr_code_rotated_at).toLocaleString('pt-BR')}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
