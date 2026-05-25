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
    <SafeAreaView className="flex-1 bg-brand-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-between p-8">
          <View className="gap-2 pt-6">
            <Text className="text-[10px] font-semibold uppercase tracking-[4px] text-steel-400">
              Sistema Integrado
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-white">Identificar-se</Text>
            <Text className="text-sm text-steel-300">
              Inicio de plantao — informe sua matricula e PIN.
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-400">
                Matricula
              </Text>
              <TextInput
                className="h-14 rounded-md border border-steel-700 bg-brand-800 px-4 text-lg font-medium text-white"
                value={matricula}
                onChangeText={setMatricula}
                placeholder="P001"
                placeholderTextColor="#5b6571"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!pending}
                selectionColor="#94a1b7"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-[10px] font-semibold uppercase tracking-[2px] text-steel-400">
                PIN
              </Text>
              <TextInput
                className="h-14 rounded-md border border-steel-700 bg-brand-800 px-4 text-2xl tracking-[6px] font-medium text-white"
                value={pin}
                onChangeText={setPin}
                placeholder="0000"
                placeholderTextColor="#5b6571"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={10}
                editable={!pending}
                selectionColor="#94a1b7"
              />
            </View>

            {error ? (
              <View className="rounded-md border border-red-900/40 bg-red-950/40 px-3 py-2">
                <Text className="text-sm text-red-300">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              className={`mt-2 h-14 items-center justify-center rounded-md ${
                canSubmit ? 'bg-white' : 'bg-steel-700'
              }`}
            >
              {pending ? (
                <ActivityIndicator color="#0e1825" />
              ) : (
                <Text
                  className={`text-base font-bold tracking-tight ${
                    canSubmit ? 'text-brand-900' : 'text-steel-400'
                  }`}
                >
                  Entrar
                </Text>
              )}
            </Pressable>
          </View>

          <View className="items-center pb-2">
            <Text className="text-[10px] uppercase tracking-[3px] text-steel-500">
              Operacao auditada
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
