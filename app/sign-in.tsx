import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BrandMark } from '@/components/brand-mark';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  canUseBiometricLogin,
  clearBiometricLogin,
  getSavedEmail,
  hasSavedLogin,
  readBiometricLogin,
  saveBiometricLogin
} from '@/lib/biometric-login';
import { palette, radii } from '@/lib/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saveLogin, setSaveLogin] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedLoginAvailable, setSavedLoginAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([canUseBiometricLogin(), hasSavedLogin(), getSavedEmail()]).then(([canUse, hasSaved, savedEmail]) => {
      if (!mounted) return;
      setBiometricAvailable(canUse);
      setSavedLoginAvailable(hasSaved);
      if (savedEmail) setEmail(savedEmail);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function signInWithCredentials(normalizedEmail: string, suppliedPassword: string, shouldSave: boolean) {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: suppliedPassword
    });

    if (error) {
      setMessage('Sign-in failed. Check your email and password, then try again.');
      return false;
    }

    if (shouldSave && biometricAvailable) {
      try {
        await saveBiometricLogin(normalizedEmail, suppliedPassword);
        setSavedLoginAvailable(true);
      } catch {
        setMessage('Signed in, but this device could not save the Face ID login.');
      }
    }

    router.replace('/');
    return true;
  }

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
      await signInWithCredentials(normalizedEmail, password, saveLogin);
    } catch {
      setMessage('Unable to reach the secure sign-in service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithFaceId() {
    setBusy(true);
    setMessage('');
    try {
      const saved = await readBiometricLogin();
      if (!saved) {
        setSavedLoginAvailable(false);
        setMessage('No saved Face ID login is available on this device. Sign in with your password once and enable Save login with Face ID.');
        return;
      }

      setEmail(saved.email);
      await signInWithCredentials(saved.email, saved.password, false);
    } catch {
      setMessage('Face ID sign-in was canceled or could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  async function removeSavedLogin() {
    setBusy(true);
    setMessage('');
    try {
      await clearBiometricLogin();
      setSavedLoginAvailable(false);
      setSaveLogin(false);
      setPassword('');
      setMessage('Saved login removed from this device.');
    } catch {
      setMessage('Unable to remove the saved login from this device.');
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
        {savedLoginAvailable && biometricAvailable ? (
          <Pressable disabled={busy || !isSupabaseConfigured} onPress={signInWithFaceId} style={{ minHeight: 52, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, borderWidth: 1.5, borderColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
            <Text selectable style={{ color: palette.brand, fontSize: 16, fontWeight: '900' }}>Sign in with Face ID</Text>
          </Pressable>
        ) : null}

        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="username" returnKeyType="next" placeholder="Email" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={signIn} placeholder="Password" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text selectable style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>Save login with Face ID</Text>
            <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 16 }}>{biometricAvailable ? 'Your password is stored in the device keychain and requires biometric authentication to read.' : 'Face ID or device biometrics are not available on this device.'}</Text>
          </View>
          <Switch value={saveLogin} onValueChange={setSaveLogin} disabled={!biometricAvailable || busy} />
        </View>

        <Pressable onPress={() => router.push('/forgot-password')} disabled={busy} hitSlop={8} style={{ alignSelf: 'flex-end', opacity: busy ? 0.5 : 1 }}>
          <Text selectable style={{ color: palette.brand, fontSize: 14, fontWeight: '800' }}>Forgot password?</Text>
        </Pressable>

        <Pressable disabled={busy || !isSupabaseConfigured} onPress={signIn} style={{ minHeight: 52, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, backgroundColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
          {busy ? <ActivityIndicator color={palette.white} /> : <Text selectable style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>Sign in</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/sign-up')} disabled={busy || !isSupabaseConfigured} style={{ minHeight: 50, opacity: busy || !isSupabaseConfigured ? 0.45 : 1, borderWidth: 1, borderColor: palette.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}>
          <Text selectable style={{ color: palette.brand, fontSize: 16, fontWeight: '900' }}>Create account</Text>
        </Pressable>

        {savedLoginAvailable ? (
          <Pressable onPress={removeSavedLogin} disabled={busy} hitSlop={8} style={{ alignSelf: 'center', opacity: busy ? 0.5 : 1, paddingVertical: 4 }}>
            <Text selectable style={{ color: palette.muted, fontSize: 13, fontWeight: '700' }}>Remove saved login</Text>
          </Pressable>
        ) : null}

        {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: message.includes('removed') || message.includes('Signed in') ? palette.text : palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}
      </View>

      <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 17 }}>MRI Safety QuickCheck is intended for trained MRI personnel and does not replace current manufacturer labeling or institutional MRI safety review.</Text>
    </ScrollView>
  );
}
