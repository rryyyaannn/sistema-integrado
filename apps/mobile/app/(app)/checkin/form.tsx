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
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-800">
        <ActivityIndicator color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (load.status === 'not_found') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-brand-800 p-8">
        <Text className="text-center text-base text-white">
          QR Code nao reconhecido. Verifique se o posto esta cadastrado.
        </Text>
        <Pressable
          onPress={() => router.replace('/(app)')}
          className="rounded-md bg-brand-500 px-4 py-3 active:opacity-80"
        >
          <Text className="text-white">Voltar</Text>
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
    const result = await submitCheckin({
      post,
      userId,
      purpose: 'entry',
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert('Erro ao registrar', result.error);
      return;
    }
    const title = result.queued ? 'Check-in enfileirado' : 'Check-in registrado';
    const message = result.queued
      ? `Sem conexao agora. Vai sincronizar automaticamente em ${post.name}.`
      : `Bom plantao em ${post.name}.`;
    Alert.alert(title, message, [{ text: 'OK', onPress: () => router.replace('/(app)') }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-800">
      <View className="flex-1 gap-6 p-6">
        <View className="gap-1">
          <Text className="text-sm text-brand-200">Posto identificado</Text>
          <Text className="text-2xl font-bold text-white">{post.name}</Text>
          <Text className="text-sm text-brand-100">{post.client_name}</Text>
          {post.address ? <Text className="text-xs text-brand-200">{post.address}</Text> : null}
        </View>

        <View className="rounded-xl bg-white/10 p-5">
          <Text className="text-sm font-medium text-white">Confirmar entrada</Text>
          <Text className="mt-1 text-xs text-brand-100">
            Voce vai registrar inicio de plantao neste posto.
          </Text>
        </View>

        <View className="mt-auto gap-3">
          <Pressable
            onPress={confirm}
            disabled={submitting}
            className={`h-14 items-center justify-center rounded-md ${
              submitting ? 'bg-brand-700' : 'bg-white'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-brand-800">Confirmar check-in</Text>
            )}
          </Pressable>
          <Pressable onPress={() => router.back()} className="py-3 active:opacity-80">
            <Text className="text-center text-sm text-brand-200">Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
