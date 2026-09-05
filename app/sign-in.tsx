import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BrandMark } from '@/components/brand-mark';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function signIn() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setMessage('Enter your email and password.');
      return;
    }
    if (!normalizedEmail.includes('@')) {
      setMessage('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        setMessage('Sign-in failed. Check your email and password, then try again.');
        return;
      }
      router.replace('/');
    } catch {
      setMessage('Unable to reach the secure sign-in service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: 22, justifyContent: 'center', gap: 22, backgroundColor: palette.bg }}>
      <BrandMark />
      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: palette.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.9 }}>Clinical access</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 15, lineHeight: 21 }}>Sign in to use protected scanner profiles, manufacturer-backed QuickChecks, and your audit history.</Text>
      </View>

      {!isSupabaseConfigured ? (
        <View style={{ backgroundColor: palette.conditionalSoft, borderRadius: radii.md, padding: 14 }}>
          <Text selectable style={{ color: palette.conditional, fontSize: 13, fontWeight: '700', lineHeight: 18 }}>Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the Expo/EAS environment before signing in.</Text>
        </View>
      ) : null}

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 13, boxShadow: '0 8px 26px rgba(20,33,43,0.07)' }}>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="username" returnKeyType="next" placeholder="Email" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={signIn} placeholder="Password" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />

        <Pressable onPress={() => router.push('/forgot-password')} disabled={busy} hitSlop={8} style={{ alignSelf: 'flex-end', opacity: busy ? 0.5 : 1 }}>
          <Text style={{ color: palette.brand, fontSize: 14, fontWeight: '800' }}>Forgot password?</Text>
        </Pressable>

        <Pressable disabled={busy || !isSupabaseConfigured} onPress={signIn} style={{ minHeight: 52, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, backgroundColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
          {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>Sign in</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/sign-up')} disabled={busy || !isSupabaseConfigured} style={{ minHeight: 50, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, borderWidth: 1, borderColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.brand, fontSize: 16, fontWeight: '900' }}>Create account</Text>
        </Pressable>

        {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}
      </View>

      <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 17 }}>MRI Safety QuickCheck is intended for trained MRI personnel and does not replace current manufacturer labeling or institutional MRI safety review.</Text>
    </ScrollView>
  );
}
