import * as Device from 'expo-device';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { cssInterop } from 'nativewind';

function getDevMenuHint() {
  cssInterop(ThemedText, { className: 'style' });
  cssInterop(ThemedView, { className: 'style' });

  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <View className="justify-between h-screen w-screen p-6">
          <View className="gap-6">
            <View>
              <ThemedText>E-mail institucional</ThemedText>
              <View className="border border-gray-600 rounded-xl px-4 py-2 bg-gray-900 flex-row items-center gap-2">
                <Text>✉️</Text>
                <TextInput />
              </View>
            </View>

            <View>
              <ThemedText>Senha</ThemedText>
              <View className="border border-gray-600 rounded-xl px-4 py-2 bg-gray-900 flex-row items-center gap-2">
                <Text>🔑</Text>
                <TextInput />
              </View>
            </View>
            <TouchableOpacity className="bg-orange-400 rounded-xl px-4 py-5 flex-row items-center gap-2 justify-center">
              <ThemedText className="text-lg font-semibold">Entrar</ThemedText>
            </TouchableOpacity>
          </View>

        </View>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
