import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';

const PUBLIC_AUTH_ROUTES = new Set(['sign-in', 'sign-up', 'forgot-password', 'reset-password', 'privacy']);

function getAuthParam(url: string, key: string) {
  try {
    const normalized = url.includes('#') ? url.replace('#', url.includes('?') ? '&' : '?') : url;
    return new URL(normalized).searchParams.get(key);
  } catch {
    return null;
  }
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;

    async function applyAuthUrl(url?: string | null) {
      if (!url) return false;

      const accessToken = getAuthParam(url, 'access_token');
      const refreshToken = getAuthParam(url, 'refresh_token');
      const code = getAuthParam(url, 'code');
      const type = getAuthParam(url, 'type');

      if (!accessToken && !refreshToken && !code) return false;

      try {
        let nextSession: Session | null = null;
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          nextSession = data.session;
        } else if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          nextSession = data.session;
        }

        if (!mounted) return true;
        if (nextSession) setSession(nextSession);
        if (type === 'recovery') router.replace('/reset-password');
        else router.replace('/');
        return true;
      } catch (error) {
        console.warn('Unable to establish auth session from deep link', error);
        return false;
      }
    }

    async function initializeAuth() {
      const initialUrl = await Linking.getInitialURL();
      await applyAuthUrl(initialUrl);
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(error ? null : data.session);
      setLoading(false);
    }

    initializeAuth();
    const urlSubscription = Linking.addEventListener('url', ({ url }) => { applyAuthUrl(url); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      urlSubscription.remove();
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
    return <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={palette.brand} /></View>;
  }

  return (
    <AppErrorBoundary>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerBackTitle: 'Back', headerTintColor: palette.brand, headerStyle: { backgroundColor: palette.bg }, headerShadowVisible: false, contentStyle: { backgroundColor: palette.bg } }}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Reset password' }} />
        <Stack.Screen name="reset-password" options={{ title: 'Choose new password' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quickcheck" options={{ title: 'New QuickCheck', presentation: 'card' }} />
        <Stack.Screen name="multi-quickcheck" options={{ title: 'Multi-Implant Assessment', presentation: 'card' }} />
      </Stack>
    </AppErrorBoundary>
  );
}