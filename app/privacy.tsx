import { ScrollView, Text, View } from 'react-native';
import { palette, radii } from '@/lib/theme';

function Section({ title, children }: { title: string; children: string }) {
  return <View style={{ gap: 6 }}><Text style={{ color: palette.text, fontSize: 17, fontWeight: '900' }}>{title}</Text><Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 20 }}>{children}</Text></View>;
}

export default function PrivacyScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 18, paddingBottom: 48, gap: 18 }}>
      <View style={{ gap: 5 }}>
        <Text style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>Privacy Policy</Text>
        <Text style={{ color: palette.muted, fontSize: 13 }}>Effective September 6, 2026 · Controlled clinician beta</Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, gap: 18 }}>
        <Section title="Information we collect">MRI Safety QuickCheck uses Supabase Authentication for account access and may store account-linked app data such as saved scanner profiles, favorites, recent-device activity, and QuickCheck history needed to provide the service.</Section>
        <Section title="Patient information">The controlled beta is not intended for patient-identifying information. Do not enter patient names, dates of birth, medical record numbers, accession numbers, images, or other protected health information into support messages, feedback, or free-text fields.</Section>
        <Section title="MRI and device information">Device, scanner, and compatibility information is used to provide the requested decision-support workflow and related history. MRI Safety QuickCheck does not replace current manufacturer MRI labeling, institutional policy, or qualified MRI personnel review.</Section>
        <Section title="Authentication and local storage">Authentication is provided through Supabase Auth. On supported iOS devices, authentication session data is stored using Expo SecureStore and platform-protected secure storage such as the iOS Keychain.</Section>
        <Section title="Feedback and support">If you choose to send beta feedback or report an MRI data issue, the app opens your email client with a prefilled message. You control whether the message is sent. Do not include patient-identifying information.</Section>
        <Section title="Crash, analytics, advertising and tracking">The controlled beta does not intentionally include third-party advertising or cross-app tracking. It does not intentionally include a third-party crash-reporting SDK. Apple, Expo, Supabase, and other service providers may process technical information according to their own service terms when their services are used.</Section>
        <Section title="Data sharing">We do not sell personal information. Information is shared with service providers only as needed to operate the application, including authentication, backend database, build/distribution, and platform services.</Section>
        <Section title="Account deletion and retention">You can delete your account from Settings in the app. Account-linked saved app data and authentication access are removed by the deletion workflow. De-identified security or audit records may be retained when needed for quality, security, legal, or regulatory purposes.</Section>
        <Section title="Security">Reasonable technical safeguards are used to protect account and application data. No electronic system can guarantee absolute security.</Section>
        <Section title="Children">MRI Safety QuickCheck is intended for professional clinical users and is not directed to children.</Section>
        <Section title="Contact">For privacy questions, use the support contact provided in MRI Safety QuickCheck Settings.</Section>
      </View>

      <View style={{ backgroundColor: palette.unknownSoft, borderRadius: radii.lg, padding: 18, gap: 6 }}>
        <Text style={{ color: palette.text, fontWeight: '900' }}>Clinical-use notice</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>MRI personnel remain responsible for confirming the exact implant, every implanted component, current manufacturer MRI labeling, patient-specific conditions, scanner parameters, and facility policy before scanning.</Text>
      </View>
    </ScrollView>
  );
}
