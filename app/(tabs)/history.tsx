import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { palette, radii, toneColors, type QuickCheckTone } from '@/lib/theme';

type CheckRow = {
  id: string;
  created_at: string;
  scanner_strength_t: number;
  scan_region: string | null;
  final_display_status: string | null;
  result: any;
};

function toneFor(status?: string | null): QuickCheckTone {
  const s = (status ?? '').toLowerCase();
  if (s.includes('conditions met') || s.includes('mr safe')) return 'safe';
  if (s.includes('not cleared') || s.includes('unsafe') || s.includes('do not')) return 'danger';
  if (s.includes('conditional')) return 'conditional';
  return 'unknown';
}

export default function HistoryScreen() {
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setRefreshing(true);
    const { data, error } = await supabase.from('scanner_checks').select('id,created_at,scanner_strength_t,scan_region,final_display_status,result').order('created_at', { ascending: false }).limit(50);
    setRefreshing(false);
    if (error) setMessage(error.message);
    else { setRows((data ?? []) as CheckRow[]); setMessage(''); }
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}>
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>QuickCheck history</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>A patient-safe audit trail of the scanner, device system, decision, and manufacturer conditions used at the time of each check.</Text>
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
        const display = row.final_display_status || row.result?.display_status || 'UNKNOWN / UNVERIFIED';
        const tone = toneFor(display);
        const colors = toneColors(tone);
        return (
          <View key={row.id} style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 16, gap: 10, borderLeftWidth: 5, borderLeftColor: colors.foreground }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text selectable style={{ flex: 1, color: colors.foreground, fontSize: 14, fontWeight: '900' }}>{display}</Text>
              <Text selectable style={{ color: palette.muted, fontSize: 12 }}>{new Date(row.created_at).toLocaleDateString()}</Text>
            </View>
            <Text selectable style={{ color: palette.text, fontSize: 15, fontWeight: '700' }}>{row.scanner_strength_t}T · {row.scan_region || 'Region not recorded'}</Text>
            {row.result?.device?.manufacturer || row.result?.device?.model ? (
              <Text selectable style={{ color: palette.muted, fontSize: 13 }}>{[row.result?.device?.manufacturer, row.result?.device?.model].filter(Boolean).join(' · ')}</Text>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
