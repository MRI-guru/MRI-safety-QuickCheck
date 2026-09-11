import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BrandMark } from '@/components/brand-mark';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [created, setCreated] = useState(false);

  async function signUp() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || !confirmPassword) {
      setMessage('Enter your email and password twice.');
      return;
    }
    if (!normalizedEmail.includes('@')) {
      setMessage('Enter a valid email address.');
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
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: 'mrisafetyquickcheck://sign-in'
        }
      });

      if (error) {
        setMessage(error.message || 'Unable to create the account.');
        return;
      }

      if (data.session) {
        router.replace('/');
        return;
      }

      setCreated(true);
      setMessage('Confirmation email sent. Open the link, then return here. If the link opens the app, sign-in will complete automatically.');
    } catch {
      setMessage('Unable to reach the secure sign-up service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function continueAfterVerification() {
    if (busy) return;
    setBusy(true);
    setMessage('Checking your account…');
    try {
      const { data: current } = await supabase.auth.getSession();
      if (current.session) {
        router.replace('/');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (error || !data.session) {
        const text = (error?.message || '').toLowerCase();
        setMessage(text.includes('confirm') || text.includes('verified')
          ? 'Your email is not confirmed yet. Open the confirmation link, then tap this button again.'
          : 'Verification may be complete, but sign-in did not finish. Tap Back to sign in and use the same email and password.');
        return;
      }
      router.replace('/');
    } catch {
      setMessage('Unable to check verification right now. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: 22, gap: 22, backgroundColor: palette.bg }}>
      <BrandMark />
      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 }}>Create your account</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 15, lineHeight: 21 }}>Use your work or personal email to create protected access to MRI Safety QuickCheck.</Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 13 }}>
        <TextInput value={email} onChangeText={setEmail} editable={!created} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" placeholder="Email" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />
        <TextInput value={password} onChangeText={setPassword} editable={!created} secureTextEntry autoComplete="new-password" textContentType="newPassword" placeholder="Password (8+ characters)" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />
        <TextInput value={confirmPassword} onChangeText={setConfirmPassword} editable={!created} secureTextEntry autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={signUp} placeholder="Confirm password" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />

        {!created ? (
          <Pressable disabled={busy || !isSupabaseConfigured} onPress={signUp} style={{ minHeight: 52, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, backgroundColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>Create account</Text>}
          </Pressable>
        ) : (
          <Pressable disabled={busy} onPress={continueAfterVerification} style={{ minHeight: 52, opacity: busy ? 0.55 : 1, backgroundColor: palette.safe, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>I confirmed my email — Continue</Text>}
          </Pressable>
        )}

        {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: created ? palette.text : palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}

        <Pressable onPress={() => router.push('/privacy')} disabled={busy} hitSlop={8} style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.5 : 1 }}>
          <Text style={{ color: palette.brand, fontSize: 14, fontWeight: '800' }}>Review Privacy Policy</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/sign-in')} style={{ minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.brand, fontSize: 15, fontWeight: '800' }}>Back to sign in</Text>
        </Pressable>
      </View>

      <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 17 }}>Access is for trained MRI personnel. Clinical decisions must remain grounded in current manufacturer labeling and institutional MRI safety review.</Text>
    </ScrollView>
  );
}