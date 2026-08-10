import { NoPlantaoNotice } from '@/components/NoPlantaoNotice';
import { captureGeo } from '@/lib/location';
import { useSession } from '@/modules/identity/session';
import { submitCheckin } from '@/modules/operations/checkin.service';
import { type ActivePlantao, getActivePlantao } from '@/modules/operations/shift.service';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Check-out — encerra o plantao (a trigger fecha o shift_session). Faz a
 * pergunta de passagem de servico: "ha pendencias para o proximo turno?".
 * Tambem oferece o pre-checkout (ADR-0011): aviso opcional de que o porteiro
 * terminou e aguarda rendicao, sem encerrar o plantao — util quando o proximo
 * ainda nao chegou.
 */
export default function EncerrarScreen() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const [plantao, setPlantao] = useState<ActivePlantao | null | 'loading'>('loading');
  const [handover, setHandover] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signalingRelief, setSignalingRelief] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void getActivePlantao(userId).then((p) => {
      if (active) setPlantao(p);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (plantao === 'loading') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-900">
        <ActivityIndicator color="#ffffff" />
      </SafeAreaView>
    );
  }
  if (!plantao || !userId) return <NoPlantaoNotice />;

  const confirm = async () => {
    setSubmitting(true);
    const geo = await captureGeo({
      latitude: plantao.post.latitude,
      longitude: plantao.post.longitude,
      geofenceRadiusM: plantao.post.geofence_radius_m,
    });
    const result = await submitCheckin({
      post: plantao.post,
      userId,
      purpose: 'exit',
      validationMethod: 'button',
      geo,
      checklistResponses: { handover_notes: handover.trim() || null },
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('Erro ao encerrar', result.error);
      return;
    }
    Alert.alert(
      result.queued ? 'Saida enfileirada' : 'Plantao encerrado',
      result.queued
        ? 'Sem conexao agora. O encerramento sincroniza quando a rede voltar.'
        : 'Check-out registrado. Bom descanso.',
      [{ text: 'OK', onPress: () => router.replace('/(app)') }],
    );
  };

  const signalRelief = async () => {
    setSignalingRelief(true);
    const geo = await captureGeo({
      latitude: plantao.post.latitude,
      longitude: plantao.post.longitude,
      geofenceRadiusM: plantao.post.geofence_radius_m,
    });
    const result = await submitCheckin({
      post: plantao.post,
      userId,
      purpose: 'pre_checkout',
      validationMethod: 'button',
      geo,
      checklistResponses: { handover_notes: handover.trim() || null },
    });
    setSignalingRelief(false);
    if (!result.ok) {
      Alert.alert('Erro ao avisar', result.error);
      return;
    }
    Alert.alert(
      'Monitoramento avisado',
      'O posto aparece como "aguardando rendicao" no painel. Voce continua no plantao ate o check-out final.',
      [{ text: 'OK', onPress: () => router.replace('/(app)') }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <View className="flex-1 p-6">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
            Encerrar plantao
          </Text>
          <Text className="text-2xl font-bold tracking-tight text-white">{plantao.post.name}</Text>
          <Text className="mt-0.5 text-sm text-steel-300">{plantao.post.client_name}</Text>
          <Text className="mt-2 text-xs uppercase tracking-[2px] text-steel-400">
            Assumido as {timeOf(plantao.openedAt)}
          </Text>
          {plantao.preCheckoutAt ? (
            <Text className="mt-1 text-xs font-semibold uppercase tracking-[2px] text-amber-300">
              Rendicao avisada as {timeOf(plantao.preCheckoutAt)} — aguardando
            </Text>
          ) : null}
        </View>

        <View className="mt-8 gap-2">
          <Text className="text-base font-semibold text-white">
            Ha pendencias para o proximo turno?
          </Text>
          <Text className="text-sm text-steel-400">
            Opcional. Ajuda quem assume depois de voce.
          </Text>
          <TextInput
            value={handover}
            onChangeText={setHandover}
            placeholder="Ex: elevador social em manutencao, portao lateral com folga..."
            placeholderTextColor="#5b6571"
            multiline
            className="mt-1 min-h-24 rounded-md border border-steel-700 bg-brand-800 p-3 text-base text-white"
            selectionColor="#94a1b7"
          />
        </View>

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
                Confirmar check-out
              </Text>
            )}
          </Pressable>
          {!plantao.preCheckoutAt ? (
            <Pressable
              onPress={signalRelief}
              disabled={signalingRelief}
              className="h-12 items-center justify-center rounded-md border border-amber-700/50 bg-amber-500/10 active:opacity-80"
            >
              {signalingRelief ? (
                <ActivityIndicator color="#fbbf24" />
              ) : (
                <Text className="text-sm font-semibold uppercase tracking-[2px] text-amber-300">
                  Avisar e aguardar rendicao
                </Text>
              )}
            </Pressable>
          ) : null}
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
