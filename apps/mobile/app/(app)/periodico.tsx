import { NoPlantaoNotice } from '@/components/NoPlantaoNotice';
import { captureGeo } from '@/lib/location';
import { useSession } from '@/modules/identity/session';
import { submitCheckin } from '@/modules/operations/checkin.service';
import { type ActivePlantao, getActivePlantao } from '@/modules/operations/shift.service';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Check-in periodico — prova de presenca ativa. Rapido de proposito (doc 07 /
 * levantamento): "Esta tudo normal?" e a pergunta central; so abre campos
 * extras se houver pendencia.
 */
export default function PeriodicoScreen() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const [plantao, setPlantao] = useState<ActivePlantao | null | 'loading'>('loading');
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  if (!plantao || !userId) {
    return <NoPlantaoNotice />;
  }

  const send = async (status: 'ok' | 'issue') => {
    setSubmitting(true);
    const geo = await captureGeo({
      latitude: plantao.post.latitude,
      longitude: plantao.post.longitude,
      geofenceRadiusM: plantao.post.geofence_radius_m,
    });
    const result = await submitCheckin({
      post: plantao.post,
      userId,
      purpose: 'periodic',
      validationMethod: 'button',
      geo,
      checklistResponses: { status, note: note.trim() || null },
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('Erro ao registrar', result.error);
      return;
    }
    Alert.alert(
      result.queued ? 'Periodico enfileirado' : 'Periodico registrado',
      status === 'issue'
        ? 'Pendencia anotada. Se for algo relevante, registre tambem uma ocorrencia.'
        : 'Presenca confirmada.',
      [{ text: 'OK', onPress: () => router.replace('/(app)') }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <View className="flex-1 p-6">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
            Check-in periodico
          </Text>
          <Text className="text-2xl font-bold tracking-tight text-white">{plantao.post.name}</Text>
          <Text className="mt-0.5 text-sm text-steel-300">{plantao.post.client_name}</Text>
        </View>

        <Text className="mt-10 text-xl font-semibold text-white">Esta tudo normal no posto?</Text>

        <View className="mt-6 gap-3">
          <Pressable
            onPress={() => send('ok')}
            disabled={submitting}
            className="h-16 items-center justify-center rounded-xl bg-emerald-600 active:opacity-90"
          >
            <Text className="text-lg font-bold tracking-tight text-white">Sim, tudo normal</Text>
          </Pressable>

          {showNote ? (
            <View className="gap-2 rounded-xl border border-amber-700/40 bg-amber-500/10 p-4">
              <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-amber-200">
                Descreva a pendencia
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="O que esta fora do normal?"
                placeholderTextColor="#5b6571"
                multiline
                className="min-h-20 rounded-md border border-steel-700 bg-brand-900 p-3 text-base text-white"
                selectionColor="#94a1b7"
              />
              <Pressable
                onPress={() => send('issue')}
                disabled={submitting}
                className="mt-1 h-12 items-center justify-center rounded-md bg-white active:opacity-80"
              >
                <Text className="text-sm font-bold tracking-tight text-brand-900">
                  Registrar periodico com pendencia
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowNote(true)}
              disabled={submitting}
              className="h-14 items-center justify-center rounded-xl border border-steel-700 active:opacity-70"
            >
              <Text className="text-base font-semibold text-steel-200">Nao, ha pendencia</Text>
            </Pressable>
          )}
        </View>

        {submitting ? (
          <View className="mt-6 flex-row items-center gap-2">
            <ActivityIndicator color="#ffffff" />
            <Text className="text-sm text-steel-400">Registrando localizacao...</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => router.back()}
          className="mt-auto h-12 items-center justify-center active:opacity-60"
        >
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-steel-400">
            Cancelar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
