import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/lib/subscription';
import { clearBiometricLogin } from '@/lib/biometric-login';
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

function ActionRow({ icon, title, detail, onPress }: { icon: string; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Row icon={icon} title={title} detail={detail} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { customerInfo, isPro, restore } = useSubscription();
  const appVersion = Constants.expoConfig?.version ?? 'unknown';
  const buildNumber = Constants.nativeBuildVersion ?? Constants.expoConfig?.ios?.buildNumber ?? 'unknown';

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

  async function sendFeedback() {
    const subject = encodeURIComponent(`MRI Safety QuickCheck App Feedback v${appVersion} (${buildNumber})`);
    const body = encodeURIComponent(
      `App version: ${appVersion}\nBuild: ${buildNumber}\n\nWhat I was testing:\n\nWhat happened:\n\nWhat I expected:\n\nDevice/implant involved (if applicable):\n\nScanner involved (if applicable):\n\nPlease do not include patient-identifying information.`
    );
    await Linking.openURL(`mailto:dballas88@gmail.com?subject=${subject}&body=${body}`);
  }

  async function reportMriDataIssue() {
    const subject = encodeURIComponent(`MRI Safety QuickCheck MRI Data Issue v${appVersion} (${buildNumber})`);
    const body = encodeURIComponent(
      `App version: ${appVersion}\nBuild: ${buildNumber}\n\nManufacturer:\n\nDevice family/model:\n\nExact component/model numbers (if known):\n\nScanner field strength/model:\n\nResult shown in QuickCheck:\n\nWhy the result appears incorrect or incomplete:\n\nManufacturer MRI labeling/source link (if available):\n\nDo not include patient names, DOB, MRN, images, accession numbers, or other patient-identifying information.`
    );
    await Linking.openURL(`mailto:dballas88@gmail.com?subject=${subject}&body=${body}`);
  }

  async function restoreAccess() {
    setRestoring(true);
    setMessage('');
    const active = await restore();
    setMessage(active ? 'MRI Safety QuickCheck Pro access restored.' : 'No active subscription was found for this Apple Account.');
    setRestoring(false);
  }

  async function deleteAccount() {
    setDeletingAccount(true);
    setMessage('');
    try {
      const { error } = await supabase.functions.invoke('delete-account', { body: { confirmation: 'DELETE' } });
      if (error) {
        setMessage('Unable to delete the account. Check your connection and contact support if the problem continues.');
        return;
      }
      await clearBiometricLogin().catch(() => undefined);
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/sign-in');
    } catch {
      setMessage('Unable to delete the account. Check your connection and contact support if the problem continues.');
    } finally {
      setDeletingAccount(false);
    }
  }

  function confirmAccountDeletion() {
    Alert.alert(
      'Permanently delete account?',
      'This deletes your MRI Safety QuickCheck account, saved scanners, favorites, recent devices, and QuickCheck history. This cannot be undone. Deleting the account does not cancel an Apple subscription; manage or cancel it separately in App Store settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: deleteAccount }
      ]
    );
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

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 18 }}>
        <Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: '900' }}>Subscription</Text>
        <Row icon={isPro ? 'checkmark.seal.fill' : 'star.circle.fill'} title={isPro ? 'Pro access active' : 'MRI Safety QuickCheck Pro'} detail={isPro ? 'Your subscription is active.' : '1 month free for eligible new subscribers, then $9.99/month or $99.99/year in the U.S. Store.'} />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <ActionRow icon="creditcard.fill" title={isPro ? 'View subscription options' : 'Start free trial'} detail="Choose monthly or annual access using Apple in-app purchase." onPress={() => router.push('/subscription')} />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <ActionRow icon="arrow.clockwise" title={restoring ? 'Restoring purchases…' : 'Restore purchases'} detail="Restore an existing subscription made with this Apple Account." onPress={restoreAccess} />
        {isPro ? (
          <>
            <View style={{ height: 1, backgroundColor: palette.line }} />
            <ActionRow icon="gearshape.fill" title="Manage subscription" detail="Change or cancel your plan in App Store account settings." onPress={() => Linking.openURL(customerInfo?.managementURL ?? 'https://apps.apple.com/account/subscriptions')} />
          </>
        ) : null}
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 18 }}>
        <Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: '900' }}>Support</Text>
        <ActionRow icon="exclamationmark.triangle.fill" title="Report MRI data issue" detail="Use this for incorrect MRI labeling, compatibility results, missing devices, model/component errors, or scanner-condition problems." onPress={reportMriDataIssue} />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <ActionRow icon="envelope.fill" title="Send general app feedback" detail="Use this for app bugs, crashes, navigation, sign-in, or workflow issues. App version and build number are added automatically." onPress={sendFeedback} />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <Row icon="hand.raised.fill" title="Privacy" detail="Do not enter patient names, dates of birth, medical record numbers, accession numbers, images, or other patient-identifying information into support messages. Account authentication is handled through Supabase." />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <ActionRow icon="hand.raised.fill" title="Privacy Policy" detail="Review how account, app, and subscription information is handled." onPress={() => router.push('/privacy')} />
        <View style={{ height: 1, backgroundColor: palette.line }} />
        <Row icon="cross.case.fill" title="Clinical use" detail="This app does not replace manufacturer MRI labeling, institutional policy, or qualified MRI personnel review. Unknown or incomplete implant configurations must remain unresolved until verified." />
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 10 }}>
        <Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: '900' }}>About this build</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>Version {appVersion} · Build {buildNumber}</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>Include this version/build when reporting any MRI labeling, device search, scanner compatibility, or exact-component issue.</Text>
      </View>

      <View style={{ backgroundColor: palette.unknownSoft, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 8 }}>
        <Text selectable style={{ color: palette.text, fontWeight: '900' }}>Clinical disclaimer</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>This application is decision support. MRI personnel remain responsible for confirming the exact implant, current manufacturer MRI labeling, patient-specific conditions, scanner settings, and facility policy before scanning.</Text>
      </View>

      <Pressable disabled={signingOut} onPress={signOut} style={{ minHeight: 50, opacity: signingOut ? 0.55 : 1, borderRadius: radii.md, borderWidth: 1, borderColor: palette.danger, alignItems: 'center', justifyContent: 'center' }}>
        {signingOut ? <ActivityIndicator color={palette.danger} /> : <Text style={{ color: palette.danger, fontSize: 15, fontWeight: '900' }}>Sign out</Text>}
      </Pressable>
      <Pressable disabled={deletingAccount} onPress={confirmAccountDeletion} style={{ minHeight: 50, opacity: deletingAccount ? 0.55 : 1, borderRadius: radii.md, backgroundColor: palette.danger, alignItems: 'center', justifyContent: 'center' }}>
        {deletingAccount ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 15, fontWeight: '900' }}>Delete account and app data</Text>}
      </Pressable>
      {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}
    </ScrollView>
  );
}
