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
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-800">
        <Text className="text-white">Verificando permissoes...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-brand-800 p-8">
        <Text className="text-center text-base text-white">
          Precisamos da camera para escanear o QR Code do posto.
        </Text>
        <Pressable
          onPress={() => void requestPermission()}
          className="rounded-md bg-brand-500 px-4 py-3 active:opacity-80"
        >
          <Text className="text-white">Conceder acesso</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="py-2">
          <Text className="text-brand-200">Cancelar</Text>
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
      <View className="absolute inset-x-0 bottom-0 items-center gap-3 p-6">
        <Text className="rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
          Aponte para o QR Code do posto
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-md bg-white/10 px-4 py-2 active:opacity-80"
        >
          <Text className="text-sm text-white">Cancelar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
