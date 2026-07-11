import { NoPlantaoNotice } from '@/components/NoPlantaoNotice';
import { captureGeo } from '@/lib/location';
import { useSession } from '@/modules/identity/session';
import { submitIncident } from '@/modules/operations/incident.service';
import { type ActivePlantao, getActivePlantao } from '@/modules/operations/shift.service';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Botao de panico. Reusa incidents (is_panic=true, severity critical) — ver
 * ADR-0007. Sem formulario: uma confirmacao rapida evita disparo acidental, e o
 * alerta e enviado imediatamente. O protocolo de resposta acontece no painel.
 */
export default function PanicoScreen() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const [plantao, setPlantao] = useState<ActivePlantao | null | 'loading'>('loading');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

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
      <SafeAreaView className="flex-1 items-center justify-center bg-red-700">
        <ActivityIndicator color="#ffffff" />
      </SafeAreaView>
    );
  }
  if (!plantao || !userId) return <NoPlantaoNotice />;

  const fire = async () => {
    setState('sending');
    const geo = await captureGeo({
      latitude: plantao.post.latitude,
      longitude: plantao.post.longitude,
      geofenceRadiusM: plantao.post.geofence_radius_m,
    });
    const result = await submitIncident({
      tenantId: plantao.post.tenant_id,
      postId: plantao.post.id,
      userId,
      title: 'Botao de panico acionado',
      severity: 'critical',
      isPanic: true,
      shiftSessionId: plantao.sessionId,
      geo,
    });
    if (!result.ok) {
      setState('idle');
      Alert.alert(
        'Falha ao enviar',
        `Nao foi possivel enviar o alerta agora (${result.error}). Se puder, tente de novo ou use o radio.`,
      );
      return;
    }
    setState('sent');
  };

  const confirmFire = () => {
    Alert.alert('Acionar panico?', `Um alerta critico sera enviado agora (${plantao.post.name}).`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'ACIONAR', style: 'destructive', onPress: fire },
    ]);
  };

  if (state === 'sent') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-6 bg-red-700 p-8">
        <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-white">
          <Text className="text-3xl text-white">✓</Text>
        </View>
        <View className="items-center gap-2">
          <Text className="text-2xl font-bold tracking-tight text-white">Alerta enviado</Text>
          <Text className="text-center text-base text-red-100">
            O monitoramento e a gerencia foram acionados. Mantenha-se seguro.
          </Text>
        </View>
        <Pressable
          onPress={() => router.replace('/(app)')}
          className="mt-4 rounded-md bg-white px-6 py-3 active:opacity-80"
        >
          <Text className="text-base font-bold tracking-tight text-red-700">Voltar ao inicio</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-red-700">
      <View className="flex-1 justify-between p-8">
        <View className="pt-6">
          <Text className="text-[10px] font-semibold uppercase tracking-[4px] text-red-200">
            Emergencia
          </Text>
          <Text className="mt-2 text-3xl font-bold tracking-tight text-white">Botao de panico</Text>
          <Text className="mt-2 text-base leading-relaxed text-red-100">
            Use em caso de risco real. Ao acionar, um alerta critico e enviado imediatamente para o
            monitoramento e a gerencia, com sua localizacao e posto.
          </Text>
          <Text className="mt-4 text-sm text-red-200">
            Posto: {plantao.post.name} — {plantao.post.client_name}
          </Text>
        </View>

        <Pressable
          onPress={confirmFire}
          disabled={state === 'sending'}
          className="h-32 items-center justify-center rounded-2xl border-4 border-white bg-red-600 active:opacity-90"
        >
          {state === 'sending' ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : (
            <Text className="text-2xl font-bold uppercase tracking-[3px] text-white">Acionar</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={state === 'sending'}
          className="h-12 items-center justify-center active:opacity-60"
        >
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-red-200">
            Cancelar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
