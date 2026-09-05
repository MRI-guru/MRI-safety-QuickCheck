import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BrandMark } from '@/components/brand-mark';
import { supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';

function getParam(url: string, key: string) {
  try {
    const normalized = url.includes('#') ? url.replace('#', url.includes('?') ? '&' : '?') : url;
    return new URL(normalized).searchParams.get(key);
  } catch {
    return null;
  }
}

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Preparing secure password reset...');

  useEffect(() => {
    let mounted = true;

    async function establishRecoverySession(url?: string | null) {
      if (!mounted) return;

      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        if (mounted) {
          setReady(true);
          setMessage('Choose a new password for your account.');
        }
        return;
      }

      if (!url) {
        if (mounted) setMessage('Open the password reset link from your email on this device.');
        return;
      }

      const accessToken = getParam(url, 'access_token');
      const refreshToken = getParam(url, 'refresh_token');
      const code = getParam(url, 'code');

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          if (mounted) setMessage('This reset link is missing required recovery information. Request a new reset link.');
          return;
        }

        if (mounted) {
          setReady(true);
          setMessage('Choose a new password for your account.');
        }
      } catch {
        if (mounted) setMessage('This password reset link is invalid or expired. Request a new reset link.');
      }
    }

    Linking.getInitialURL().then(establishRecoverySession);
    const subscription = Linking.addEventListener('url', ({ url }) => establishRecoverySession(url));

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  async function updatePassword() {
    if (!ready) {
      setMessage('Open a valid password reset link from your email first.');
      return;
    }
    if (password.length < 8) {
      setMessage('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message || 'Unable to update the password.');
        return;
      }

      setMessage('Password updated.');
      router.replace('/');
    } catch {
      setMessage('Unable to update the password. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: 22, gap: 22, backgroundColor: palette.bg }}>
      <BrandMark />
      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 }}>Choose a new password</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 15, lineHeight: 21 }}>Your recovery link must be opened on this device before the password can be changed.</Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 13 }}>
        <TextInput value={password} onChangeText={setPassword} editable={ready && !busy} secureTextEntry autoComplete="new-password" textContentType="newPassword" placeholder="New password (8+ characters)" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16, opacity: ready ? 1 : 0.55 }} />
        <TextInput value={confirmPassword} onChangeText={setConfirmPassword} editable={ready && !busy} secureTextEntry autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={updatePassword} placeholder="Confirm new password" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16, opacity: ready ? 1 : 0.55 }} />

        <Pressable disabled={!ready || busy} onPress={updatePassword} style={{ minHeight: 52, opacity: !ready || busy ? 0.45 : 1, backgroundColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
          {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>Update password</Text>}
        </Pressable>

        {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: ready ? palette.text : palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}

        {!ready ? (
          <Pressable onPress={() => router.replace('/forgot-password')} style={{ minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: palette.brand, fontSize: 15, fontWeight: '800' }}>Request a new reset link</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}
