import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? '/app';

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sistema Integrado</CardTitle>
          <p className="text-sm text-neutral-500">Painel administrativo</p>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </main>
  );
}
