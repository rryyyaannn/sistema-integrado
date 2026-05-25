import { flushPendingCheckins, pendingCheckinsCount } from '@/db/queue';
import { signOut, useSession } from '@/modules/identity/session';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const session = useSession();
  const meta = session.status === 'authenticated' ? session.session.user.user_metadata : null;
  const fullName = (meta?.full_name as string | undefined) ?? 'Colaborador';
  const employeeCode = (meta?.employee_code as string | undefined) ?? '';
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setPending(await pendingCheckinsCount());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const count = await pendingCheckinsCount();
        if (cancelled) return;
        setPending(count);
        if (count > 0) {
          setSyncing(true);
          const { sent } = await flushPendingCheckins();
          if (cancelled) return;
          setSyncing(false);
          if (sent > 0) {
            setPending(await pendingCheckinsCount());
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const manualSync = async () => {
    setSyncing(true);
    const { sent, failed } = await flushPendingCheckins();
    setSyncing(false);
    await refresh();
    Alert.alert('Sincronizacao', `Enviados: ${sent}. Pendentes: ${failed}.`);
  };

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <ScrollView contentContainerClassName="flex-grow p-6 gap-6">
        <View className="flex-row items-center justify-between gap-4 border-b border-steel-700/40 pb-5">
          <View className="flex-1 gap-1">
            <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
              Plantao em curso
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-white">{fullName}</Text>
            {employeeCode ? (
              <Text className="text-xs uppercase tracking-[2px] text-steel-400">
                Matricula {employeeCode}
              </Text>
            ) : null}
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-steel-700">
            <Text className="text-base font-bold text-white">{initials || '·'}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(app)/checkin/qr')}
          className="rounded-xl bg-white p-6 active:opacity-90"
        >
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-500">
            Acao primaria
          </Text>
          <Text className="mt-2 text-xl font-bold tracking-tight text-brand-900">
            Fazer check-in
          </Text>
          <Text className="mt-1 text-sm text-steel-600">
            Escaneie o QR Code do posto para registrar entrada ou periodico.
          </Text>
        </Pressable>

        {pending > 0 ? (
          <View className="rounded-xl border border-amber-700/30 bg-amber-500/10 p-5">
            <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-amber-200">
              Pendente de envio
            </Text>
            <Text className="mt-1 text-base font-semibold text-amber-100">
              {pending} {pending === 1 ? 'check-in aguardando' : 'check-ins aguardando'}
            </Text>
            <Text className="mt-1 text-xs text-amber-200/70">
              Sera enviado automaticamente quando a rede voltar.
            </Text>
            <Pressable
              onPress={manualSync}
              disabled={syncing}
              className="mt-4 h-11 items-center justify-center rounded-md bg-white active:opacity-80"
            >
              <Text className="text-sm font-bold tracking-tight text-brand-900">
                {syncing ? 'Sincronizando...' : 'Tentar reenviar agora'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="mt-auto pt-4">
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace('/auth/login');
            }}
            className="h-12 items-center justify-center rounded-md border border-steel-700 active:opacity-70"
          >
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-steel-300">
              Encerrar plantao
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
