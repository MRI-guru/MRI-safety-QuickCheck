import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BrandMark } from '@/components/brand-mark';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  async function sendReset() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setMessage('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: 'mrisafetyquickcheck://reset-password'
      });

      setSent(true);
      setMessage('If an account exists for that email, a password reset link has been sent. Open the email on this iPhone and tap the reset link.');
    } catch {
      setMessage('Unable to reach the password reset service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: 22, gap: 22, backgroundColor: palette.bg }}>
      <BrandMark />
      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 }}>Reset your password</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 15, lineHeight: 21 }}>Enter the email used for MRI Safety QuickCheck. We will send a secure recovery link.</Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 13 }}>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" returnKeyType="send" onSubmitEditing={sendReset} placeholder="Email" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />

        <Pressable disabled={busy || !isSupabaseConfigured} onPress={sendReset} style={{ minHeight: 52, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, backgroundColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
          {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>{sent ? 'Send another reset link' : 'Send reset link'}</Text>}
        </Pressable>

        {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: sent ? palette.text : palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}

        <Pressable onPress={() => router.replace('/sign-in')} style={{ minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.brand, fontSize: 15, fontWeight: '800' }}>Back to sign in</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
