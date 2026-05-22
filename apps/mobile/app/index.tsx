import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generateUuidV7 } from '@si/core';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ConnState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

export default function HomeScreen() {
  const [conn, setConn] = useState<ConnState>({ status: 'loading' });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConn({ status: 'unconfigured' });
      return;
    }

    let active = true;
    void (async () => {
      const { error } = await supabase.from('tenants').select('id').limit(1);
      if (!active) {
        return;
      }
      setConn(error ? { status: 'error', message: error.message } : { status: 'ok' });
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-brand-800">
      <View className="flex-1 items-center justify-center gap-6 p-8">
        <View className="items-center gap-2">
          <Text className="text-sm font-medium text-brand-200">Sprint 1 — Fundação técnica</Text>
          <Text className="text-3xl font-bold text-white">Sistema Integrado</Text>
          <Text className="text-base text-brand-100">App de campo</Text>
        </View>

        <View className="w-full max-w-sm rounded-xl bg-white/10 p-5">
          <Text className="mb-2 text-sm font-semibold text-white">Conexão com o banco</Text>
          <ConnectionStatus conn={conn} />
        </View>

        <Text className="text-xs text-brand-300">UUID v7 de exemplo: {generateUuidV7()}</Text>
      </View>
    </SafeAreaView>
  );
}

function ConnectionStatus({ conn }: { conn: ConnState }) {
  switch (conn.status) {
    case 'loading':
      return <ActivityIndicator color="#ffffff" />;
    case 'unconfigured':
      return (
        <Text className="text-sm text-amber-300">
          Configure o arquivo .env (veja .env.example).
        </Text>
      );
    case 'error':
      return <Text className="text-sm text-red-300">Erro: {conn.message}</Text>;
    case 'ok':
      return <Text className="text-sm text-green-300">Conexão OK.</Text>;
  }
}
