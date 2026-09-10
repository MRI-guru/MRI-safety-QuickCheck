import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { palette, radii, toneColors, type QuickCheckTone } from '@/lib/theme';

type CheckRow = {
  id: string;
  created_at: string;
  device_id: string;
  scanner_model_id: string | null;
  scanner_profile_id: string | null;
  scanner_strength_t: number;
  scan_region: string | null;
  result: any;
};

function toneFor(result: any): QuickCheckTone {
  if (result?.hard_conflict === true || result?.status === 'unsafe' || result?.status === 'not_cleared') return 'danger';
  if (result?.safe_to_scan === true && result?.conditions_met === true) return 'safe';
  if (result?.status === 'conditional') return 'conditional';
  return 'unknown';
}

function contextKey(row: CheckRow) {
  return [
    row.scanner_profile_id ?? '(none)',
    row.scanner_model_id ?? '(none)',
    Number(row.scanner_strength_t),
    (row.scan_region ?? '').trim().toLowerCase()
  ].join('|');
}

function deviceLabel(row: CheckRow) {
  const d = row.result?.device ?? {};
  return [d.manufacturer, d.family, d.model || d.manufacturer_model_number].filter(Boolean).join(' · ') || 'Implant QuickCheck';
}

export default function MultiQuickCheckScreen() {
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [combined, setCombined] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedRows = useMemo(() => rows.filter((row) => selectedSet.has(row.id)), [rows, selectedSet]);
  const combinedTone = toneFor(combined);

  async function load() {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('scanner_checks')
      .select('id,created_at,device_id,scanner_model_id,scanner_profile_id,scanner_strength_t,scan_region,result')
      .order('created_at', { ascending: false })
      .limit(60);
    setRefreshing(false);
    if (error) {
      setMessage('Unable to load recent exact QuickChecks. Pull down to try again.');
      return;
    }
    setRows((data ?? []) as CheckRow[]);
    setMessage('');
  }

  useState(() => {
    load();
    return undefined;
  });

  async function toggleRow(row: CheckRow) {
    setCombined(null);
    setMessage('');
    if (selectedSet.has(row.id)) {
      setSelectedIds((current) => current.filter((id) => id !== row.id));
      await Haptics.selectionAsync();
      return;
    }

    if (selectedRows.length > 0 && contextKey(selectedRows[0]) !== contextKey(row)) {
      setMessage('That implant was checked under a different scanner or scan region. Re-run it under the same exam context before combining.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setSelectedIds((current) => [...current, row.id]);
    await Haptics.selectionAsync();
  }

  async function combine() {
    if (selectedIds.length < 2 || busy) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('quickcheck_combine_exact_checks', { p_check_ids: selectedIds });
    setBusy(false);
    if (error) {
      setCombined(null);
      setMessage('Unable to combine these implant checks. Re-run the affected implant and try again.');
      return;
    }
    setCombined(data);
    if (data?.safe_to_scan === true) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (data?.hard_conflict === true) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 16 }}
    >
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>Multi-implant assessment</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>
          Run one exact QuickCheck for every implanted device, then combine the matching checks below. A cleared implant can never override an unresolved or conflicting implant.
        </Text>
      </View>

      <View style={{ backgroundColor: palette.conditionalSoft, borderRadius: radii.md, padding: 14, gap: 5 }}>
        <Text selectable style={{ color: palette.conditional, fontWeight: '900' }}>No patient identifiers</Text>
        <Text selectable style={{ color: palette.text, fontSize: 12, lineHeight: 17 }}>
          Do not enter or record patient name, date of birth, MRN, accession number, or other identifying information in this workflow.
        </Text>
      </View>

      <Link href="/quickcheck" asChild>
        <Pressable style={{ minHeight: 50, borderRadius: radii.md, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.white, fontSize: 15, fontWeight: '900' }}>Run another implant QuickCheck</Text>
        </Pressable>
      </Link>

      {selectedRows.length > 0 ? (
        <View style={{ backgroundColor: palette.brandSoft, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.brand, padding: 15, gap: 8 }}>
          <Text style={{ color: palette.brand, fontSize: 11, fontWeight: '900' }}>CURRENT PATIENT ASSESSMENT</Text>
          <Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: '900' }}>{selectedRows.length} implant{selectedRows.length === 1 ? '' : 's'} selected</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
            {selectedRows[0].scanner_strength_t}T · {selectedRows[0].scan_region || 'scan region not recorded'} · same saved scanner/exam context required
          </Text>
          <Pressable onPress={() => { setSelectedIds([]); setCombined(null); setMessage(''); }} style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
            <Text style={{ color: palette.brand, fontWeight: '800' }}>Clear selection</Text>
          </Pressable>
        </View>
      ) : null}

      {message ? <Text selectable accessibilityLiveRegion="polite" style={{ color: palette.danger, fontSize: 13, lineHeight: 18 }}>{message}</Text> : null}

      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: palette.text, fontSize: 18, fontWeight: '900' }}>Recent exact QuickChecks</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>Select at least two checks performed for the same saved scanner and scan region.</Text>
      </View>

      {!rows.length && !refreshing ? (
        <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, padding: 22, alignItems: 'center', gap: 10 }}>
          <Image source="sf:rectangle.stack.badge.plus" style={{ width: 36, height: 36 }} tintColor={palette.muted} />
          <Text selectable style={{ color: palette.text, fontWeight: '900' }}>No recent exact checks</Text>
          <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 13, lineHeight: 18 }}>Run an exact QuickCheck for each implant, then return here and pull down to refresh.</Text>
        </View>
      ) : null}

      {rows.map((row) => {
        const selected = selectedSet.has(row.id);
        const tone = toneFor(row.result);
        const colors = toneColors(tone);
        const display = row.result?.display_status || 'UNKNOWN / UNVERIFIED';
        return (
          <Pressable
            key={row.id}
            onPress={() => toggleRow(row)}
            style={{
              backgroundColor: selected ? palette.brandSoft : palette.surface,
              borderRadius: radii.lg,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? palette.brand : palette.line,
              padding: 15,
              gap: 8
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text selectable style={{ color: palette.text, fontSize: 15, fontWeight: '900' }}>{deviceLabel(row)}</Text>
                <Text selectable style={{ color: colors.foreground, fontSize: 12, fontWeight: '900' }}>{display}</Text>
                <Text selectable style={{ color: palette.muted, fontSize: 12 }}>{row.scanner_strength_t}T · {row.scan_region || 'region not recorded'} · {new Date(row.created_at).toLocaleString()}</Text>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: selected ? palette.brand : palette.line, alignItems: 'center', justifyContent: 'center' }}>
                {selected ? <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: palette.brand }} /> : null}
              </View>
            </View>
            <Text selectable style={{ color: palette.muted, fontSize: 11, lineHeight: 16 }}>
              {row.result?.safe_to_scan === true && row.result?.conditions_met === true
                ? 'Exact result recorded with displayed conditions met.'
                : row.result?.hard_conflict === true
                  ? 'Hard conflict recorded — this will control the combined patient result.'
                  : 'This implant is still unresolved or has unconfirmed conditions.'}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        disabled={selectedIds.length < 2 || busy}
        onPress={combine}
        style={{ minHeight: 56, opacity: selectedIds.length < 2 || busy ? 0.45 : 1, borderRadius: radii.md, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center' }}
      >
        {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900' }}>Combine Selected Implants</Text>}
      </Pressable>

      {combined ? (
        <View style={{ gap: 10 }}>
          <View style={{ backgroundColor: combinedTone === 'danger' ? palette.danger : combinedTone === 'safe' ? palette.safe : combinedTone === 'conditional' ? palette.conditionalSoft : palette.unknownSoft, borderRadius: radii.lg, padding: 18, gap: 8, borderWidth: combinedTone === 'safe' || combinedTone === 'danger' ? 0 : 1, borderColor: combinedTone === 'conditional' ? palette.conditional : palette.line }}>
            <Text style={{ color: combinedTone === 'danger' || combinedTone === 'safe' ? palette.white : palette.muted, fontSize: 11, fontWeight: '900' }}>COMBINED PATIENT RESULT</Text>
            <Text selectable style={{ color: combinedTone === 'danger' || combinedTone === 'safe' ? palette.white : palette.text, fontSize: 23, fontWeight: '900' }}>{combined.display_status}</Text>
            <Text selectable style={{ color: combinedTone === 'danger' || combinedTone === 'safe' ? palette.white : palette.text, fontSize: 13, lineHeight: 19 }}>{combined.decision}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, padding: 12 }}><Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800' }}>IMPLANTS</Text><Text style={{ color: palette.text, fontSize: 18, fontWeight: '900' }}>{combined.implant_count ?? selectedIds.length}</Text></View>
            <View style={{ flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, padding: 12 }}><Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800' }}>UNRESOLVED</Text><Text style={{ color: palette.text, fontSize: 18, fontWeight: '900' }}>{combined.unresolved_implant_count ?? 0}</Text></View>
            <View style={{ flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, padding: 12 }}><Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800' }}>HARD STOPS</Text><Text style={{ color: palette.text, fontSize: 18, fontWeight: '900' }}>{combined.hard_stop_implant_count ?? 0}</Text></View>
          </View>
        </View>
      ) : null}

      <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 17 }}>
        Combined status is fail-closed. Every implanted device must be represented by an exact QuickCheck performed for the same scanner and exam. Current manufacturer labeling and institutional MRI safety review remain authoritative.
      </Text>
    </ScrollView>
  );
}
