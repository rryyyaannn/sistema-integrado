import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lockRef = useRef(false);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-900">
        <Text className="text-sm uppercase tracking-[3px] text-steel-400">
          Verificando permissoes...
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-5 bg-brand-900 p-8">
        <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-steel-400">
          Permissao necessaria
        </Text>
        <Text className="text-center text-base leading-relaxed text-white">
          Precisamos da camera para escanear o QR Code do posto e registrar o check-in.
        </Text>
        <Pressable
          onPress={() => void requestPermission()}
          className="mt-2 rounded-md bg-white px-5 py-3 active:opacity-80"
        >
          <Text className="text-sm font-bold tracking-tight text-brand-900">Conceder acesso</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="py-2 active:opacity-60">
          <Text className="text-sm uppercase tracking-[2px] text-steel-400">Cancelar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleScan = ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setScanned(true);
    router.replace({ pathname: '/(app)/checkin/form', params: { token: data } });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {/* overlay */}
      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <View className="h-64 w-64 rounded-xl border-2 border-white/80" />
      </View>

      <View className="absolute inset-x-0 top-4 items-center px-6 pointer-events-none">
        <View className="rounded-full bg-brand-900/80 px-4 py-1.5">
          <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-white">
            Aponte para o QR do posto
          </Text>
        </View>
      </View>

      <View className="absolute inset-x-0 bottom-0 items-center gap-3 p-6">
        <Pressable
          onPress={() => router.back()}
          className="rounded-md bg-white/10 px-5 py-2.5 backdrop-blur active:opacity-80"
        >
          <Text className="text-sm font-medium text-white">Cancelar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
