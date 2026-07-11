import { useSession } from '@/modules/identity/session';
import { type PostByToken, listActivePosts } from '@/modules/operations/checkin.service';
import { type ScheduledPost, getTodaySchedule } from '@/modules/operations/shift.service';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Data =
  | { status: 'loading' }
  | { status: 'ready'; scheduled: ScheduledPost[]; allPosts: PostByToken[] };

export default function AssumirPostoScreen() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.session.user.id : null;
  const [data, setData] = useState<Data>({ status: 'loading' });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void (async () => {
      const scheduled = await getTodaySchedule(userId);
      const allPosts = scheduled.length === 0 ? await listActivePosts() : [];
      if (active) setData({ status: 'ready', scheduled, allPosts });
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const assumeById = (postId: string) => {
    router.push({ pathname: '/(app)/checkin/form', params: { postId, purpose: 'entry' } });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <ScrollView contentContainerClassName="flex-grow p-6 gap-6">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
            Inicio de plantao
          </Text>
          <Text className="text-2xl font-bold tracking-tight text-white">Assumir posto</Text>
          <Text className="mt-1 text-sm text-steel-300">
            O QR Code comprova o local. Sem QR, o registro e aceito e marcado para conferencia.
          </Text>
        </View>

        {/* Acao forte: QR */}
        <Pressable
          onPress={() => router.push('/(app)/checkin/qr')}
          className="rounded-xl bg-white p-5 active:opacity-90"
        >
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-500">
            Recomendado
          </Text>
          <Text className="mt-1.5 text-xl font-bold tracking-tight text-brand-900">
            Escanear QR Code do posto
          </Text>
          <Text className="mt-1 text-sm text-steel-600">
            Aponte a camera para o QR fixado no posto.
          </Text>
        </Pressable>

        {data.status === 'loading' ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-500">
              {data.scheduled.length > 0 ? 'Sua escala de hoje — sem QR' : 'Assumir sem QR'}
            </Text>

            {data.scheduled.length > 0
              ? data.scheduled.map((s) => (
                  <PostRow
                    key={s.scheduleId}
                    name={s.post.name}
                    detail={`${s.post.client_name}${s.shiftName ? ` · ${s.shiftName}` : ''}`}
                    onPress={() => assumeById(s.post.id)}
                  />
                ))
              : data.allPosts.map((p) => (
                  <PostRow
                    key={p.id}
                    name={p.name}
                    detail={p.client_name}
                    onPress={() => assumeById(p.id)}
                  />
                ))}
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          className="mt-auto h-12 items-center justify-center active:opacity-60"
        >
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-steel-400">
            Cancelar
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function PostRow({
  name,
  detail,
  onPress,
}: {
  name: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl border border-steel-700/50 bg-brand-800/40 p-4 active:opacity-80"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{name}</Text>
        <Text className="mt-0.5 text-xs text-steel-400">{detail}</Text>
      </View>
      <Text className="text-lg text-steel-400">›</Text>
    </Pressable>
  );
}
