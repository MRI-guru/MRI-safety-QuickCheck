import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inSignIn = segments[0] === 'sign-in';
    if (!session && !inSignIn) router.replace('/sign-in');
    if (session && inSignIn) router.replace('/');
  }, [loading, session, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.brand} />
      </View>
    );
  }

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
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quickcheck" options={{ title: 'New QuickCheck', presentation: 'card' }} />
      </Stack>
    </>
  );
}
