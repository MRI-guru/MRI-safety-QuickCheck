import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { BrandMark } from '@/components/brand-mark';
import { StatusCard } from '@/components/status-card';
import { palette, radii, spacing } from '@/lib/theme';

function ActionRow({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
      <View style={{ width: 40, height: 40, borderRadius: 13, borderCurve: 'continuous', backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={`sf:${icon}`} style={{ width: 21, height: 21 }} tintColor={palette.brand} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{detail}</Text>
      </View>
      <Image source="sf:chevron.right" style={{ width: 12, height: 18 }} tintColor={palette.muted} />
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: 40, gap: 18 }}>
      <BrandMark />

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 12, boxShadow: '0 6px 22px rgba(20,33,43,0.07)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: palette.safe }} />
          <Text selectable style={{ color: palette.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.7 }}>SCANNER PROFILE</Text>
        </View>
        <View style={{ gap: 3 }}>
          <Text selectable style={{ color: palette.text, fontSize: 20, fontWeight: '800' }}>Select or save your scanner</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>QuickCheck will compare every implant against the exact scanner field strength and profile you choose.</Text>
        </View>
        <Link href="/(tabs)/scanners" asChild>
          <Pressable style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: palette.brandSoft, borderRadius: radii.pill }}>
            <Text style={{ color: palette.brand, fontSize: 13, fontWeight: '800' }}>Manage scanners</Text>
          </Pressable>
        </Link>
      </View>

      <Link href="/quickcheck" asChild>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={{ backgroundColor: palette.brand, borderRadius: radii.lg, borderCurve: 'continuous', padding: 22, gap: 14, boxShadow: '0 10px 28px rgba(10,85,122,0.24)' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ width: 52, height: 52, borderRadius: 17, borderCurve: 'continuous', backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
              <Image source="sf:shield.lefthalf.filled.badge.checkmark" style={{ width: 29, height: 29 }} tintColor={palette.white} />
            </View>
            <Image source="sf:arrow.up.right" style={{ width: 22, height: 22 }} tintColor={palette.white} />
          </View>
          <View style={{ gap: 5 }}>
            <Text selectable style={{ color: palette.white, fontSize: 28, fontWeight: '850', letterSpacing: -0.8 }}>New QuickCheck</Text>
            <Text selectable style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 21 }}>Scanner → device → exact components → manufacturer conditions.</Text>
          </View>
        </Pressable>
      </Link>

      <View style={{ gap: 10 }}>
        <Text selectable style={{ color: palette.text, fontSize: 18, fontWeight: '800' }}>How results read</Text>
        <StatusCard tone="safe" eyebrow="Verified" title="Conditions met" detail="All required manufacturer conditions have been confirmed for the selected scanner and exact system." />
        <StatusCard tone="conditional" eyebrow="MR Conditional" title="Verify conditions" detail="The system may be eligible, but required manufacturer conditions still need confirmation." />
        <StatusCard tone="danger" eyebrow="Hard stop" title="Not cleared for selected scanner" detail="The selected field strength, region, or exact component configuration is not permitted by the verified labeling." />
        <StatusCard tone="unknown" eyebrow="Fail closed" title="Unknown / unverified" detail="The app does not infer eligibility from similar devices. Exact current manufacturer labeling must be verified." />
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 18 }}>
        <ActionRow icon="magnifyingglass" title="Manufacturer-first search" detail="Search exact generator, model, lead, extension, catheter, adapter, or electrode." />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <ActionRow icon="doc.text.magnifyingglass" title="Source traceability" detail="Every decision is designed to point back to current manufacturer MRI labeling." />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <ActionRow icon="lock.shield.fill" title="Fail-closed engine" detail="Missing serials, components, configuration details, or required confirmations stay unverified." />
      </View>

      <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 17 }}>
        Decision support only. Final MRI screening remains subject to current manufacturer labeling, patient-specific review, and facility policy.
      </Text>
    </ScrollView>
  );
}
