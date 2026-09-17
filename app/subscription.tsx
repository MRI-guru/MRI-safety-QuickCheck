import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSubscription } from '@/lib/subscription';
import { palette, radii, spacing } from '@/lib/theme';

function PlanCard({ item, name, cadence, bestValue, trialEligible, busy, onPurchase }: {
  item: PurchasesPackage;
  name: string;
  cadence: string;
  bestValue?: boolean;
  trialEligible: boolean;
  busy: boolean;
  onPurchase: () => void;
}) {
  return (
    <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', borderWidth: bestValue ? 2 : 1, borderColor: bestValue ? palette.brand : palette.line, padding: 18, gap: 13 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text selectable style={{ color: palette.text, fontSize: 19, fontWeight: '900' }}>{name}</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 14 }}>{item.product.priceString} {cadence}</Text>
        </View>
        {bestValue ? (
          <View style={{ backgroundColor: palette.brandSoft, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: palette.brand, fontSize: 11, fontWeight: '900' }}>BEST VALUE</Text>
          </View>
        ) : null}
      </View>
      <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
        {trialEligible ? `1 month free, then ${item.product.priceString} ${cadence}.` : `${item.product.priceString} ${cadence}.`}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onPurchase}
        style={{ minHeight: 50, borderRadius: radii.md, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.55 : 1 }}
      >
        {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 15, fontWeight: '900' }}>{trialEligible ? 'Start 1-month free trial' : `Choose ${name}`}</Text>}
      </Pressable>
    </View>
  );
}

export default function SubscriptionScreen() {
  const { offering, trialEligibleProductIds, isPro, loading, error, purchase, refresh, restore } = useSubscription();
  const [busyId, setBusyId] = useState('');
  const [restoreBusy, setRestoreBusy] = useState(false);
  const plans = useMemo(() => [
    offering?.annual ? { item: offering.annual, name: 'Annual', cadence: 'per year', bestValue: true } : null,
    offering?.monthly ? { item: offering.monthly, name: 'Monthly', cadence: 'per month', bestValue: false } : null
  ].filter(Boolean) as Array<{ item: PurchasesPackage; name: string; cadence: string; bestValue: boolean }>, [offering]);

  async function buy(item: PurchasesPackage) {
    setBusyId(item.identifier);
    const active = await purchase(item);
    setBusyId('');
    if (active) router.replace('/quickcheck');
  }

  async function restoreAccess() {
    setRestoreBusy(true);
    const active = await restore();
    setRestoreBusy(false);
    if (active) router.replace('/quickcheck');
  }

  if (isPro) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: 48, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
          <View style={{ width: 68, height: 68, borderRadius: 23, backgroundColor: palette.safeSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Image source="sf:checkmark.seal.fill" style={{ width: 36, height: 36 }} tintColor={palette.safe} />
          </View>
          <Text selectable style={{ color: palette.text, fontSize: 25, fontWeight: '900', textAlign: 'center' }}>Pro access is active</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>Your MRI Safety QuickCheck subscription is ready.</Text>
        </View>
        <Pressable onPress={() => router.replace('/quickcheck')} style={{ minHeight: 52, borderRadius: radii.md, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.white, fontWeight: '900' }}>Start a QuickCheck</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: 48, gap: 18 }}>
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 10 }}>
        <View style={{ width: 62, height: 62, borderRadius: 21, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Image source="sf:shield.checkered" style={{ width: 33, height: 33 }} tintColor={palette.brand} />
        </View>
        <Text selectable style={{ color: palette.text, fontSize: 27, fontWeight: '900', textAlign: 'center', letterSpacing: -0.6 }}>MRI Safety QuickCheck Pro</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>Search implant guidance, compare the selected MRI scanner, and review source-traceable conditions.</Text>
      </View>

      {loading ? <ActivityIndicator color={palette.brand} style={{ marginVertical: 28 }} /> : null}
      {!loading && !plans.length ? (
        <View style={{ backgroundColor: palette.unknownSoft, borderRadius: radii.lg, padding: 18, gap: 12 }}>
          <Text selectable style={{ color: palette.text, fontWeight: '900' }}>Subscription options are temporarily unavailable.</Text>
          <Pressable onPress={refresh} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 9 }}>
            <Text style={{ color: palette.brand, fontWeight: '900' }}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {plans.map(plan => (
        <PlanCard
          key={plan.item.identifier}
          {...plan}
          trialEligible={trialEligibleProductIds.has(plan.item.product.identifier)}
          busy={Boolean(busyId)}
          onPurchase={() => buy(plan.item)}
        />
      ))}

      {error ? <Text selectable accessibilityLiveRegion="polite" style={{ color: palette.danger, fontSize: 13, lineHeight: 18 }}>{error}</Text> : null}

      <Pressable accessibilityRole="button" disabled={restoreBusy || Boolean(busyId)} onPress={restoreAccess} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
        {restoreBusy ? <ActivityIndicator color={palette.brand} /> : <Text style={{ color: palette.brand, fontSize: 14, fontWeight: '900' }}>Restore purchases</Text>}
      </Pressable>

      <Text selectable style={{ color: palette.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' }}>
        Payment is charged to your Apple Account at confirmation. If eligible, the free trial converts to the selected auto-renewing subscription unless canceled at least 24 hours before the trial ends. Subscriptions renew automatically unless canceled at least 24 hours before the current period ends. Manage or cancel in App Store account settings.
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
        <Pressable onPress={() => router.push('/privacy')}><Text style={{ color: palette.brand, fontSize: 12, fontWeight: '800' }}>Privacy Policy</Text></Pressable>
        <Pressable onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}><Text style={{ color: palette.brand, fontSize: 12, fontWeight: '800' }}>Terms of Use</Text></Pressable>
      </View>
    </ScrollView>
  );
}
