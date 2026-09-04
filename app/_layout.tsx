import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { palette } from '@/lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: 'Back',
          headerTintColor: palette.brand,
          headerStyle: { backgroundColor: palette.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.bg }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quickcheck" options={{ title: 'New QuickCheck', presentation: 'card' }} />
      </Stack>
    </>
  );
}
