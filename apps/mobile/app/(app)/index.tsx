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

  // Refresh ao focar a tela + tenta flush automatico se tem pendentes.
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

  return (
    <SafeAreaView className="flex-1 bg-brand-800">
      <ScrollView contentContainerClassName="flex-1 p-6 gap-6">
        <View className="gap-1">
          <Text className="text-sm text-brand-200">Bom plantao,</Text>
          <Text className="text-2xl font-bold text-white">{fullName}</Text>
          {employeeCode ? (
            <Text className="text-sm text-brand-100">Matricula {employeeCode}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => router.push('/(app)/checkin/qr')}
          className="rounded-xl bg-white p-6 active:opacity-80"
        >
          <Text className="text-lg font-semibold text-brand-800">Fazer check-in</Text>
          <Text className="mt-1 text-sm text-neutral-500">
            Escaneie o QR Code do posto para registrar entrada ou periodico.
          </Text>
        </Pressable>

        {pending > 0 ? (
          <View className="rounded-xl bg-amber-500/20 p-4">
            <Text className="text-sm font-medium text-amber-100">
              {pending} {pending === 1 ? 'check-in pendente' : 'check-ins pendentes'} de envio
            </Text>
            <Pressable
              onPress={manualSync}
              disabled={syncing}
              className="mt-3 rounded-md bg-white/90 px-3 py-2 active:opacity-80"
            >
              <Text className="text-center text-sm font-medium text-brand-800">
                {syncing ? 'Sincronizando...' : 'Tentar reenviar agora'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="mt-auto">
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace('/auth/login');
            }}
            className="rounded-md border border-white/30 py-3 active:opacity-80"
          >
            <Text className="text-center text-sm font-medium text-white">Sair do plantao</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
