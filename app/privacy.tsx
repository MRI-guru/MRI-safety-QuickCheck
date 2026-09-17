import { ScrollView, Text, View } from 'react-native';
import { palette, radii, spacing } from '@/lib/theme';

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: '900' }}>{title}</Text>
      <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 20 }}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: 48, gap: 18 }}>
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: palette.text, fontSize: 27, fontWeight: '900' }}>Privacy Policy</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 12 }}>Effective September 17, 2026</Text>
      </View>
      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, gap: 20 }}>
        <Section title="Information we process">MRI Safety QuickCheck processes your account email and authentication identifier, saved scanner profiles, favorites, recent devices, and QuickCheck history so the app can provide its account-based features. Do not enter patient names, dates of birth, medical record numbers, images, or other patient-identifying information.</Section>
        <Section title="Service providers">Supabase provides authentication and database services. Apple processes App Store payments. RevenueCat validates subscription status and may process purchase identifiers and subscription history needed to provide Pro access.</Section>
        <Section title="How information is used">Information is used to authenticate your account, operate the app, retain your settings and history, verify subscription access, provide support you request, and protect the service. We do not sell personal information.</Section>
        <Section title="Retention and deletion">Account information is retained while your account is active and as needed for service, security, and legal obligations. You can permanently delete your account and associated app data from Settings. Account deletion does not cancel an Apple subscription, which must be managed separately through the App Store.</Section>
        <Section title="Security and contact">Authentication sessions are stored using iOS Keychain-backed secure storage. No system can guarantee absolute security. For privacy questions or requests, contact dballas88@gmail.com.</Section>
      </View>
      <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>This policy may be updated as the service changes. Material changes will be reflected by a revised effective date.</Text>
    </ScrollView>
  );
}
