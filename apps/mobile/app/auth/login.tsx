import { signInWithMatriculaPin, useSession } from '@/modules/identity/session';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const session = useSession();
  const [matricula, setMatricula] = useState('');
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ja autenticado: vai direto pra home interna.
  if (session.status === 'authenticated') {
    return <Redirect href="/(app)" />;
  }

  const canSubmit = matricula.trim().length > 0 && pin.length >= 4 && !pending;

  const submit = async () => {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    const result = await signInWithMatriculaPin({ matricula, pin });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace('/(app)');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-800">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 items-center justify-center gap-6 p-8">
          <View className="items-center gap-2">
            <Text className="text-sm font-medium text-brand-200">Sistema Integrado</Text>
            <Text className="text-2xl font-bold text-white">Identificar-se</Text>
            <Text className="text-sm text-brand-100">Use sua matricula e PIN do plantao</Text>
          </View>

          <View className="w-full max-w-sm gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-brand-100">Matricula</Text>
              <TextInput
                className="h-12 rounded-md bg-white px-3 text-base text-neutral-900"
                value={matricula}
                onChangeText={setMatricula}
                placeholder="P001"
                placeholderTextColor="#a3a3a3"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!pending}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-brand-100">PIN</Text>
              <TextInput
                className="h-12 rounded-md bg-white px-3 text-base text-neutral-900"
                value={pin}
                onChangeText={setPin}
                placeholder="****"
                placeholderTextColor="#a3a3a3"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={10}
                editable={!pending}
              />
            </View>

            {error ? <Text className="text-sm text-red-300">{error}</Text> : null}

            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              className={`h-12 items-center justify-center rounded-md ${
                canSubmit ? 'bg-brand-500' : 'bg-brand-700'
              }`}
            >
              {pending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-medium text-white">Entrar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
