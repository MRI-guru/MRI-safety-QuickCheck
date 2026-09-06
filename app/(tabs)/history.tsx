import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { palette, radii, toneColors, type QuickCheckTone } from '@/lib/theme';

type CheckRow = {
  id: string;
  created_at: string;
  scanner_strength_t: number;
  scan_region: string | null;
  final_display_status: string | null;
  scanner_profile_id: string | null;
  generator_serial_number: string | null;
  implant_metadata: Record<string, unknown> | null;
  condition_confirmations: Record<string, boolean> | null;
  condition_checklist: any[] | null;
  result: any;
};

function toneFor(status?: string | null): QuickCheckTone {
  const s = (status ?? '').toLowerCase();
  if (s.includes('conditions met') || s.includes('mr safe')) return 'safe';
  if (s.includes('not cleared') || s.includes('unsafe') || s.includes('do not')) return 'danger';
  if (s.includes('conditional')) return 'conditional';
  return 'unknown';
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={{ gap: 2 }}>
      <Text selectable style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}>{label.toUpperCase()}</Text>
      <Text selectable style={{ color: palette.text, fontSize: 13, lineHeight: 18 }}>{String(value)}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('scanner_checks')
      .select('id,created_at,scanner_strength_t,scan_region,final_display_status,scanner_profile_id,generator_serial_number,implant_metadata,condition_confirmations,condition_checklist,result')
      .order('created_at', { ascending: false })
      .limit(50);
    setRefreshing(false);
    if (error) setMessage(error.message);
    else { setRows((data ?? []) as CheckRow[]); setMessage(''); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}>
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>QuickCheck history</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>Review the scanner, exact implanted components, confirmations, manufacturer source, and final decision recorded for each check.</Text>
      </View>

      {message ? <Text selectable style={{ color: palette.danger }}>{message}</Text> : null}
      {!rows.length && !refreshing ? (
        <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, padding: 24, alignItems: 'center', gap: 10 }}>
          <Image source="sf:clock.badge.questionmark" style={{ width: 36, height: 36 }} tintColor={palette.muted} />
          <Text selectable style={{ color: palette.text, fontWeight: '800' }}>No checks yet</Text>
          <Text selectable style={{ color: palette.muted, textAlign: 'center', fontSize: 13, lineHeight: 18 }}>Completed QuickChecks will appear here automatically.</Text>
        </View>
      ) : null}

      {rows.map((row) => {
        const result = row.result ?? {};
        const display = row.final_display_status || result.display_status || 'UNKNOWN / UNVERIFIED';
        const tone = toneFor(display);
        const colors = toneColors(tone);
        const isExpanded = !!expanded[row.id];
        const scannerProfile = result.scanner_profile;
        const scanner = result.scanner;
        const components = Array.isArray(result.components) ? result.components : [];
        const source = result.source || components.find((x: any) => x?.result?.source)?.result?.source || result.manufacturer_guidance?.source;
        const checklist = Array.isArray(row.condition_checklist) && row.condition_checklist.length ? row.condition_checklist : (Array.isArray(result.condition_checklist) ? result.condition_checklist : []);
        const confirmations = row.condition_confirmations ?? {};
        const confirmedCount = Object.values(confirmations).filter(Boolean).length;
        const deviceName = [result.device?.manufacturer, result.device?.family, result.device?.model || result.device?.manufacturer_model_number].filter(Boolean).join(' · ');
        const scannerName = scannerProfile
          ? [scannerProfile.nickname, scannerProfile.manufacturer, scannerProfile.model].filter(Boolean).join(' · ')
          : [scanner?.manufacturer, scanner?.model].filter(Boolean).join(' · ');

        return (
          <View key={row.id} style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 16, gap: 11, borderLeftWidth: 5, borderLeftColor: colors.foreground }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text selectable style={{ flex: 1, color: colors.foreground, fontSize: 14, fontWeight: '900' }}>{display}</Text>
              <Text selectable style={{ color: palette.muted, fontSize: 12 }}>{new Date(row.created_at).toLocaleString()}</Text>
            </View>

            {deviceName ? <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>{deviceName}</Text> : null}
            <Text selectable style={{ color: palette.text, fontSize: 14, fontWeight: '700' }}>{row.scanner_strength_t}T · {row.scan_region || 'Region not recorded'}</Text>
            {scannerName ? <Text selectable style={{ color: palette.muted, fontSize: 13 }}>{scannerName}</Text> : null}

            <Pressable onPress={() => setExpanded((v) => ({ ...v, [row.id]: !v[row.id] }))} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
              <Text style={{ color: palette.brand, fontSize: 13, fontWeight: '800' }}>{isExpanded ? 'Hide audit details' : 'View audit details'}</Text>
              <Image source={isExpanded ? 'sf:chevron.up' : 'sf:chevron.down'} style={{ width: 13, height: 13 }} tintColor={palette.brand} />
            </Pressable>

            {isExpanded ? (
              <View style={{ borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 12, gap: 12 }}>
                <Detail label="Decision" value={result.decision || result.reason} />
                <Detail label="Next action" value={result.next_action} />
                <Detail label="Verification basis" value={result.verification_basis} />
                <Detail label="Engine version" value={result.engine_version} />
                <Detail label="Generator serial" value={row.generator_serial_number || result.generator_serial_number} />

                {components.length ? (
                  <View style={{ gap: 5 }}>
                    <Text selectable style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}>EXACT COMPONENTS</Text>
                    {components.map((item: any, index: number) => (
                      <Text key={`${row.id}-component-${index}`} selectable style={{ color: palette.text, fontSize: 13, lineHeight: 18 }}>
                        {item.slot ? `${item.slot}: ` : ''}{item.component?.model || item.result?.component?.model || 'Component recorded'}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {checklist.length ? (
                  <View style={{ gap: 5 }}>
                    <Text selectable style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}>CONDITION CONFIRMATIONS</Text>
                    <Text selectable style={{ color: palette.text, fontSize: 13 }}>{confirmedCount} confirmed · {checklist.length} checklist items recorded</Text>
                    {checklist.slice(0, 8).map((item: any, index: number) => {
                      const key = item?.key || `item_${index}`;
                      const label = typeof item === 'string' ? item : (item?.label || item?.requirement || key);
                      const checked = confirmations[key] === true || item?.confirmed === true;
                      return <Text key={`${row.id}-condition-${index}`} selectable style={{ color: checked ? palette.text : palette.muted, fontSize: 12, lineHeight: 17 }}>{checked ? '✓' : '○'} {label}</Text>;
                    })}
                    {checklist.length > 8 ? <Text selectable style={{ color: palette.muted, fontSize: 12 }}>+ {checklist.length - 8} more conditions recorded</Text> : null}
                  </View>
                ) : null}

                {source ? (
                  <View style={{ gap: 7 }}>
                    <Text selectable style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}>MANUFACTURER SOURCE</Text>
                    <Text selectable style={{ color: palette.text, fontSize: 13, fontWeight: '700' }}>{source.title || 'Manufacturer MRI labeling'}</Text>
                    {source.document_version || source.source_version ? <Text selectable style={{ color: palette.muted, fontSize: 12 }}>Version: {source.document_version || source.source_version}</Text> : null}
                    {source.source_url ? (
                      <Pressable onPress={() => Linking.openURL(source.source_url)} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, paddingHorizontal: 12, paddingVertical: 9, borderRadius: radii.pill }}>
                        <Text style={{ color: palette.brand, fontSize: 12, fontWeight: '900' }}>Open Manufacturer MRI Instructions</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}

                {row.implant_metadata && Object.keys(row.implant_metadata).length ? (
                  <Detail label="Implant metadata recorded" value={Object.entries(row.implant_metadata).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')} />
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
