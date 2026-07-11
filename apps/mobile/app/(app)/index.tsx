import { flushPendingCheckins, pendingCheckinsCount } from '@/db/queue';
import { signOut, useSession } from '@/modules/identity/session';
import {
  type ActivePlantao,
  type ScheduledPost,
  getActivePlantao,
  getTodaySchedule,
} from '@/modules/operations/shift.service';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoadState =
  | { status: 'loading' }
  | { status: 'active'; plantao: ActivePlantao }
  | { status: 'idle'; schedule: ScheduledPost[] };

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const meta = session.status === 'authenticated' ? session.session.user.user_metadata : null;
  const fullName = (meta?.full_name as string | undefined) ?? 'Colaborador';
  const employeeCode = (meta?.employee_code as string | undefined) ?? '';

  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [plantao, count] = await Promise.all([getActivePlantao(userId), pendingCheckinsCount()]);
    setPending(count);
    if (plantao) {
      setLoad({ status: 'active', plantao });
    } else {
      setLoad({ status: 'idle', schedule: await getTodaySchedule(userId) });
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const count = await pendingCheckinsCount();
        if (count > 0) {
          setSyncing(true);
          await flushPendingCheckins();
          if (cancelled) return;
          setSyncing(false);
        }
        if (!cancelled) await refresh();
      })();
      return () => {
        cancelled = true;
      };
    }, [refresh]),
  );

  const manualSync = async () => {
    setSyncing(true);
    const { sent, failed } = await flushPendingCheckins();
    setSyncing(false);
    await refresh();
    Alert.alert('Sincronizacao', `Enviados: ${sent}. Pendentes: ${failed}.`);
  };

  const leaveApp = () => {
    const hasActive = load.status === 'active';
    Alert.alert(
      'Sair do aplicativo',
      hasActive
        ? 'Voce tem um plantao ativo. Sair NAO encerra o plantao — use "Encerrar plantao" para o check-out de saida. Deseja apenas sair do app?'
        : 'Deseja sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ],
    );
  };

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <ScrollView contentContainerClassName="flex-grow p-6 gap-5">
        {/* Cabecalho do colaborador */}
        <View className="flex-row items-center justify-between gap-4 border-b border-steel-700/40 pb-5">
          <View className="flex-1 gap-1">
            <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
              Colaborador
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

        {load.status === 'loading' ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : load.status === 'active' ? (
          <PlantaoAtivo plantao={load.plantao} />
        ) : (
          <SemPlantao schedule={load.schedule} />
        )}

        {/* Fila offline */}
        {pending > 0 ? (
          <View className="rounded-xl border border-amber-700/30 bg-amber-500/10 p-5">
            <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-amber-200">
              Pendente de envio
            </Text>
            <Text className="mt-1 text-base font-semibold text-amber-100">
              {pending} {pending === 1 ? 'registro aguardando' : 'registros aguardando'}
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
            onPress={leaveApp}
            className="h-11 items-center justify-center rounded-md border border-steel-700 active:opacity-70"
          >
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-steel-400">
              Sair do aplicativo
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlantaoAtivo({ plantao }: { plantao: ActivePlantao }) {
  return (
    <View className="gap-5">
      {/* Status do plantao */}
      <View className="rounded-xl border border-emerald-800/40 bg-emerald-500/10 p-5">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-emerald-400" />
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-emerald-300">
            Plantao ativo
          </Text>
        </View>
        <Text className="mt-2 text-2xl font-bold tracking-tight text-white">
          {plantao.post.name}
        </Text>
        <Text className="mt-0.5 text-sm text-steel-300">{plantao.post.client_name}</Text>
        <Text className="mt-2 text-xs uppercase tracking-[2px] text-steel-400">
          Assumido as {timeOf(plantao.openedAt)}
        </Text>
      </View>

      {/* Acoes do plantao */}
      <ActionCard
        title="Check-in periodico"
        subtitle="Confirme presenca e a situacao do posto."
        onPress={() => router.push('/(app)/periodico')}
        variant="primary"
      />
      <ActionCard
        title="Registrar ocorrencia"
        subtitle="Algo aconteceu no posto? Registre agora."
        onPress={() => router.push('/(app)/ocorrencia')}
      />
      <ActionCard
        title="Encerrar plantao"
        subtitle="Check-out de saida e passagem de servico."
        onPress={() => router.push('/(app)/encerrar')}
      />

      {/* Panico — sempre visivel e em destaque */}
      <Pressable
        onPress={() => router.push('/(app)/panico')}
        className="mt-1 h-16 flex-row items-center justify-center gap-3 rounded-xl bg-red-600 active:opacity-90"
      >
        <View className="h-3 w-3 rounded-full bg-white" />
        <Text className="text-lg font-bold uppercase tracking-[2px] text-white">Panico</Text>
      </Pressable>
    </View>
  );
}

function SemPlantao({ schedule }: { schedule: ScheduledPost[] }) {
  return (
    <View className="gap-5">
      <View className="rounded-xl border border-steel-700/40 bg-brand-800/40 p-5">
        <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
          Nenhum plantao ativo
        </Text>
        <Text className="mt-2 text-lg font-semibold text-white">
          Voce ainda nao assumiu um posto
        </Text>
        {schedule.length > 0 ? (
          <Text className="mt-1 text-sm text-steel-300">
            Hoje voce esta escalado para {schedule.length}{' '}
            {schedule.length === 1 ? 'posto' : 'postos'}.
          </Text>
        ) : (
          <Text className="mt-1 text-sm text-steel-300">
            Sem escala para hoje — voce ainda pode assumir qualquer posto.
          </Text>
        )}
      </View>

      <ActionCard
        title="Assumir posto"
        subtitle="Inicie o plantao: escaneie o QR ou selecione o posto."
        onPress={() => router.push('/(app)/assumir')}
        variant="primary"
      />
    </View>
  );
}

function ActionCard({
  title,
  subtitle,
  onPress,
  variant,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  variant?: 'primary';
}) {
  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} className="rounded-xl bg-white p-5 active:opacity-90">
        <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-500">
          Acao primaria
        </Text>
        <Text className="mt-1.5 text-xl font-bold tracking-tight text-brand-900">{title}</Text>
        <Text className="mt-1 text-sm text-steel-600">{subtitle}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-steel-700/50 bg-brand-800/40 p-5 active:opacity-80"
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
      <Text className="mt-1 text-sm text-steel-400">{subtitle}</Text>
    </Pressable>
  );
}
