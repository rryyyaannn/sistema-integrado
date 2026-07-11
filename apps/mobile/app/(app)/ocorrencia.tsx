import { NoPlantaoNotice } from '@/components/NoPlantaoNotice';
import { captureGeo } from '@/lib/location';
import { useSession } from '@/modules/identity/session';
import {
  type IncidentCategory,
  listIncidentCategories,
  submitIncident,
} from '@/modules/operations/incident.service';
import { type ActivePlantao, getActivePlantao } from '@/modules/operations/shift.service';
import type { Enums } from '@si/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SEVERITIES: {
  value: Enums<'incident_severity'>;
  label: string;
  active: string;
  text: string;
}[] = [
  {
    value: 'low',
    label: 'Baixa',
    active: 'border-emerald-700/50 bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  {
    value: 'medium',
    label: 'Media',
    active: 'border-amber-700/50 bg-amber-500/10',
    text: 'text-amber-300',
  },
  {
    value: 'high',
    label: 'Alta',
    active: 'border-orange-700/50 bg-orange-500/10',
    text: 'text-orange-300',
  },
  {
    value: 'critical',
    label: 'Critica',
    active: 'border-red-700/50 bg-red-500/10',
    text: 'text-red-300',
  },
];

export default function OcorrenciaScreen() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const [plantao, setPlantao] = useState<ActivePlantao | null | 'loading'>('loading');
  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Enums<'incident_severity'>>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void (async () => {
      const p = await getActivePlantao(userId);
      if (!active) return;
      setPlantao(p);
      if (p) setCategories(await listIncidentCategories(p.post.tenant_id));
    })();
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

  const pickCategory = (cat: IncidentCategory) => {
    if (categoryId === cat.id) {
      setCategoryId(null);
      return;
    }
    setCategoryId(cat.id);
    setSeverity(cat.severity_default);
    if (!title.trim()) setTitle(cat.name);
  };

  const canSubmit = title.trim().length > 0 && !submitting;

  const confirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const geo = await captureGeo({
      latitude: plantao.post.latitude,
      longitude: plantao.post.longitude,
      geofenceRadiusM: plantao.post.geofence_radius_m,
    });
    const result = await submitIncident({
      tenantId: plantao.post.tenant_id,
      postId: plantao.post.id,
      userId,
      title: title.trim(),
      description: description.trim() || null,
      severity,
      incidentCategoryId: categoryId,
      shiftSessionId: plantao.sessionId,
      geo,
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('Erro ao registrar', result.error);
      return;
    }
    Alert.alert('Ocorrencia registrada', 'O supervisor podera acompanhar no painel.', [
      { text: 'OK', onPress: () => router.replace('/(app)') },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <ScrollView contentContainerClassName="flex-grow p-6 gap-6">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
            Nova ocorrencia
          </Text>
          <Text className="text-2xl font-bold tracking-tight text-white">{plantao.post.name}</Text>
          <Text className="mt-0.5 text-sm text-steel-300">{plantao.post.client_name}</Text>
        </View>

        {categories.length > 0 ? (
          <View className="gap-2">
            <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-400">
              Categoria
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => pickCategory(cat)}
                    className={`rounded-md border px-3 py-2 ${
                      selected ? 'border-white bg-white' : 'border-steel-700 bg-brand-800'
                    }`}
                  >
                    <Text
                      className={`text-sm ${selected ? 'text-brand-900 font-semibold' : 'text-steel-200'}`}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="gap-2">
          <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-400">
            Gravidade
          </Text>
          <View className="flex-row gap-2">
            {SEVERITIES.map((s) => {
              const selected = severity === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setSeverity(s.value)}
                  className={`flex-1 items-center rounded-md border py-2.5 ${
                    selected ? s.active : 'border-steel-700 bg-brand-800'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      selected ? s.text : 'text-steel-400'
                    }`}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-400">
            Titulo
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Resumo curto da ocorrencia"
            placeholderTextColor="#5b6571"
            className="h-12 rounded-md border border-steel-700 bg-brand-800 px-3 text-base text-white"
            selectionColor="#94a1b7"
          />
        </View>

        <View className="gap-2">
          <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-400">
            Descricao
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="O que aconteceu?"
            placeholderTextColor="#5b6571"
            multiline
            className="min-h-24 rounded-md border border-steel-700 bg-brand-800 p-3 text-base text-white"
            selectionColor="#94a1b7"
          />
        </View>

        <View className="gap-3">
          <Pressable
            onPress={confirm}
            disabled={!canSubmit}
            className={`h-14 items-center justify-center rounded-md ${
              canSubmit ? 'bg-white' : 'bg-steel-700'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#0e1825" />
            ) : (
              <Text
                className={`text-base font-bold tracking-tight ${
                  canSubmit ? 'text-brand-900' : 'text-steel-400'
                }`}
              >
                Registrar ocorrencia
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
      </ScrollView>
    </SafeAreaView>
  );
}
