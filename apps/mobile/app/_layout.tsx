// Polyfills — precisam vir antes de qualquer outro import.
// - get-random-values: habilita crypto.getRandomValues (usado por generateUuidV7).
// - url-polyfill: o supabase-js depende da API URL no React Native.
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
