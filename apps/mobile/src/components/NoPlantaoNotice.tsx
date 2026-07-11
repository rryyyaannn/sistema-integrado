import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Exibido quando uma acao exige plantao ativo e nao ha nenhum. */
export function NoPlantaoNotice() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-brand-900 p-8">
      <Text className="text-center text-base text-white">
        Voce nao tem plantao ativo. Assuma um posto primeiro.
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
