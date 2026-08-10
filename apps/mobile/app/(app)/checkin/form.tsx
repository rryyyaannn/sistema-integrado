import { captureGeo } from '@/lib/location';
import { useSession } from '@/modules/identity/session';
import {
  type PostByToken,
  findPostByToken,
  getPostById,
  submitCheckin,
} from '@/modules/operations/checkin.service';
import { getTodaySchedule } from '@/modules/operations/shift.service';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'ready'; post: PostByToken; scheduleIdForPost: string | null };

const SERVICE_TYPE_LABEL: Record<string, string> = {
  portaria: 'Portaria',
  servicos_gerais: 'Servicos gerais',
  tecnico: 'Tecnico',
  monitoramento: 'Monitoramento',
};

/**
 * Confirmacao do check-in de ENTRADA (assumir posto). Recebe `token` (via QR,
 * validacao forte) OU `postId` (sem QR, validacao por botao). Captura a geo no
 * momento da confirmacao. Periodico e saida tem telas proprias.
 */
export default function CheckinFormScreen() {
  const { token, postId } = useLocalSearchParams<{ token?: string; postId?: string }>();
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const viaQr = !!token;
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      const post = token ? await findPostByToken(token) : postId ? await getPostById(postId) : null;
      if (!post) {
        if (active) setLoad({ status: 'not_found' });
        return;
      }
      const schedule = userId ? await getTodaySchedule(userId) : [];
      const match = schedule.find((s) => s.post.id === post.id);
      if (!active) return;
      setLoad({ status: 'ready', post, scheduleIdForPost: match?.scheduleId ?? null });
    })();
    return () => {
      active = false;
    };
  }, [token, postId, userId]);

  if (load.status === 'loading' || session.status === 'loading') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-900">
        <ActivityIndicator color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (load.status === 'not_found') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-brand-900 p-8">
        <Text className="text-center text-base text-white">
          Posto nao reconhecido. Verifique o QR ou selecione o posto na lista.
        </Text>
        <Pressable
          onPress={() => router.replace('/(app)')}
          className="rounded-md bg-white px-5 py-3 active:opacity-80"
        >
          <Text className="text-sm font-bold tracking-tight text-brand-900">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (session.status !== 'authenticated' || !userId) return null;

  const post = load.post;
  const unscheduled = load.scheduleIdForPost === null;

  const confirm = async () => {
    setSubmitting(true);
    const geo = await captureGeo({
      latitude: post.latitude,
      longitude: post.longitude,
      geofenceRadiusM: post.geofence_radius_m,
    });
    const result = await submitCheckin({
      post,
      userId,
      purpose: 'entry',
      validationMethod: viaQr ? 'qr' : 'button',
      qrTokenUsed: viaQr ? token : null,
      scheduleId: load.scheduleIdForPost,
      unscheduled,
      checklistResponses: unscheduled && reason.trim() ? { reason: reason.trim() } : undefined,
      geo,
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('Erro ao registrar', result.error);
      return;
    }
    const title = result.queued ? 'Plantao aberto (offline)' : 'Plantao aberto';
    const message = result.queued
      ? `Sem conexao agora. Vai sincronizar quando a rede voltar (${post.name}).`
      : `Bom plantao em ${post.name}.`;
    Alert.alert(title, message, [{ text: 'OK', onPress: () => router.replace('/(app)') }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <View className="flex-1 p-6">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
            Posto identificado
          </Text>
          <Text className="text-3xl font-bold tracking-tight text-white">{post.name}</Text>
          <Text className="mt-1 text-sm text-steel-300">{post.client_name}</Text>
          {post.address ? (
            <Text className="mt-0.5 text-xs uppercase tracking-wider text-steel-500">
              {post.address}
            </Text>
          ) : null}
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Badge label={SERVICE_TYPE_LABEL[post.service_type] ?? post.service_type} />
            {viaQr ? (
              <Badge label="QR confirmado" tone="ok" />
            ) : (
              <Badge label="Sem QR" tone="warn" />
            )}
            {unscheduled ? <Badge label="Fora da escala" tone="warn" /> : null}
          </View>
        </View>

        <View className="mt-8 gap-3 rounded-xl border border-steel-700/40 bg-brand-800/40 p-5">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
            Confirmar entrada
          </Text>
          <Text className="text-sm leading-relaxed text-steel-300">
            Voce vai iniciar o plantao neste posto. Registro imutavel com horario e localizacao.
            {viaQr
              ? ''
              : ' Como nao houve QR, o evento fica marcado para conferencia do supervisor.'}
          </Text>
        </View>

        {unscheduled ? (
          <View className="mt-4 gap-2">
            <Text className="text-sm font-semibold text-white">Motivo da troca (opcional)</Text>
            <Text className="text-xs text-steel-400">
              Este posto nao esta na sua escala de hoje. Um motivo simples ajuda o monitoramento.
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Ex: troca de ultima hora com outro colega..."
              placeholderTextColor="#5b6571"
              multiline
              className="mt-1 min-h-16 rounded-md border border-steel-700 bg-brand-800 p-3 text-base text-white"
              selectionColor="#94a1b7"
            />
          </View>
        ) : null}

        <View className="mt-auto gap-3">
          <Pressable
            onPress={confirm}
            disabled={submitting}
            className={`h-14 items-center justify-center rounded-md ${
              submitting ? 'bg-steel-700' : 'bg-white'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#0e1825" />
            ) : (
              <Text className="text-base font-bold tracking-tight text-brand-900">
                Confirmar e assumir posto
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="h-12 items-center justify-center active:opacity-60"
          >
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-steel-400">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Badge({ label, tone }: { label: string; tone?: 'ok' | 'warn' }) {
  const cls =
    tone === 'ok'
      ? 'border-emerald-700/50 bg-emerald-500/10'
      : tone === 'warn'
        ? 'border-amber-700/50 bg-amber-500/10'
        : 'border-steel-700 bg-brand-800';
  const textCls =
    tone === 'ok' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : 'text-steel-300';
  return (
    <View className={`self-start rounded-sm border px-2 py-0.5 ${cls}`}>
      <Text className={`text-[10px] font-semibold uppercase tracking-[2px] ${textCls}`}>
        {label}
      </Text>
    </View>
  );
}
