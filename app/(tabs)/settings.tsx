import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';

function Row({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={`sf:${icon}`} style={{ width: 22, height: 22 }} tintColor={palette.brand} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text selectable style={{ color: palette.text, fontSize: 15, fontWeight: '800' }}>{title}</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>{detail}</Text>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage('Unable to sign out. Check your connection and try again.');
        return;
      }
      router.replace('/sign-in');
    } catch {
      setMessage('Unable to sign out. Check your connection and try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 18 }}>
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>Settings</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>MRI Safety QuickCheck · iPhone-first clinical decision support.</Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 18 }}>
        <Row icon="building.2.fill" title="Facility workflow" detail="Scanner profiles and future facility-specific policy overlays live here without replacing manufacturer labeling." />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <Row icon="checkmark.seal.fill" title="Manufacturer-first evidence" detail="QuickCheck is designed to fail closed when exact current device labeling cannot be verified." />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <Row icon="lock.shield.fill" title="Protected account" detail="Supabase Auth sessions are stored in the iOS Keychain through Expo SecureStore." />
      </View>

      <View style={{ backgroundColor: palette.unknownSoft, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 8 }}>
        <Text selectable style={{ color: palette.text, fontWeight: '900' }}>Clinical disclaimer</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>This application is decision support. MRI personnel remain responsible for confirming the exact implant, current manufacturer MRI labeling, patient-specific conditions, scanner settings, and facility policy before scanning.</Text>
      </View>

      <Pressable disabled={signingOut} onPress={signOut} style={{ minHeight: 50, opacity: signingOut ? 0.55 : 1, borderRadius: radii.md, borderWidth: 1, borderColor: palette.danger, alignItems: 'center', justifyContent: 'center' }}>
        {signingOut ? <ActivityIndicator color={palette.danger} /> : <Text style={{ color: palette.danger, fontSize: 15, fontWeight: '900' }}>Sign out</Text>}
      </Pressable>
      {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}
    </ScrollView>
  );
}
