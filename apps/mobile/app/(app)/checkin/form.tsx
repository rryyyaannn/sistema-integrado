import { useSession } from '@/modules/identity/session';
import {
  type PostByToken,
  findPostByToken,
  submitCheckin,
} from '@/modules/operations/checkin.service';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'ready'; post: PostByToken };

const SERVICE_TYPE_LABEL: Record<string, string> = {
  portaria: 'Portaria',
  servicos_gerais: 'Servicos gerais',
  tecnico: 'Tecnico',
  monitoramento: 'Monitoramento',
};

export default function CheckinFormScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const session = useSession();
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoad({ status: 'not_found' });
      return;
    }
    let active = true;
    void findPostByToken(token).then((post) => {
      if (!active) return;
      setLoad(post ? { status: 'ready', post } : { status: 'not_found' });
    });
    return () => {
      active = false;
    };
  }, [token]);

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
          QR Code nao reconhecido. Verifique se o posto esta cadastrado.
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

  if (session.status !== 'authenticated') {
    return null;
  }

  const post = load.post;
  const userId = session.session.user.id;

  const confirm = async () => {
    setSubmitting(true);
    const result = await submitCheckin({ post, userId, purpose: 'entry' });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('Erro ao registrar', result.error);
      return;
    }
    const title = result.queued ? 'Check-in enfileirado' : 'Check-in registrado';
    const message = result.queued
      ? `Sem conexao agora. Vai sincronizar automaticamente quando a rede voltar (${post.name}).`
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
          <View className="mt-3 self-start rounded-sm border border-steel-700 bg-brand-800 px-2 py-0.5">
            <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-300">
              {SERVICE_TYPE_LABEL[post.service_type] ?? post.service_type}
            </Text>
          </View>
        </View>

        <View className="mt-8 gap-4 rounded-xl border border-steel-700/40 bg-brand-800/40 p-5">
          <View>
            <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
              Acao
            </Text>
            <Text className="mt-1 text-base font-semibold text-white">Confirmar entrada</Text>
          </View>
          <Text className="text-sm leading-relaxed text-steel-300">
            Voce vai registrar inicio de plantao neste posto. A acao gera um registro imutavel com
            horario e localizacao.
          </Text>
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
                Confirmar check-in
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
