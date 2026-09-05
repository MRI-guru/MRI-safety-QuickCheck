import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';

const PUBLIC_AUTH_ROUTES = new Set(['sign-in', 'sign-up', 'forgot-password', 'reset-password']);

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setSession(error ? null : data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const route = segments[0] as string | undefined;
    const inPublicAuthRoute = route ? PUBLIC_AUTH_ROUTES.has(route) : false;

    if (!session && !inPublicAuthRoute) router.replace('/sign-in');
    else if (session && route === 'sign-in') router.replace('/');
  }, [loading, session, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.brand} />
      </View>
    );
  }

  return (
    <AppErrorBoundary>
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
        <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Reset password' }} />
        <Stack.Screen name="reset-password" options={{ title: 'Choose new password' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quickcheck" options={{ title: 'New QuickCheck', presentation: 'card' }} />
      </Stack>
    </AppErrorBoundary>
  );
}
