import { useSession } from '@/modules/identity/session';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

/**
 * Layout do grupo autenticado: bloqueia acesso sem sessao.
 */
export default function AppLayout() {
  const session = useSession();

  if (session.status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-brand-800">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (session.status === 'anonymous') {
    return <Redirect href="/auth/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
