import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';
import { StatusCard } from '@/components/status-card';

type ScannerOption = { id: string; manufacturer: string; model: string; field_strength_t: number };
type DeviceOption = { id: string; manufacturer?: string; model?: string; family?: string; device_type?: string };
type ComponentOption = { id: string; model?: string; component_type?: string };
type SelectedComponent = ComponentOption & { slot: string };

function SectionTitle({ step, title, detail }: { step: string; title: string; detail: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text selectable style={{ color: palette.brand, fontSize: 12, fontWeight: '800', letterSpacing: 0.7 }}>{step}</Text>
      <Text selectable style={{ color: palette.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.4 }}>{title}</Text>
      <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>{detail}</Text>
    </View>
  );
}

function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, borderCurve: 'continuous', paddingHorizontal: 14 }}>
      <Image source="sf:magnifyingglass" style={{ width: 18, height: 18 }} tintColor={palette.muted} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={palette.muted} style={{ flex: 1, height: 50, color: palette.text, fontSize: 16 }} />
    </View>
  );
}

export default function QuickCheckScreen() {
  const [scannerSearch, setScannerSearch] = useState('');
  const [scanners, setScanners] = useState<ScannerOption[]>([]);
  const [scanner, setScanner] = useState<ScannerOption | null>(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [device, setDevice] = useState<DeviceOption | null>(null);
  const [componentSearch, setComponentSearch] = useState('');
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [scanRegion, setScanRegion] = useState('full body');
  const [serialNumber, setSerialNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const tone = useMemo(() => {
    const status = result?.status;
    if (status === 'safe') return 'safe' as const;
    if (status === 'conditional') return 'conditional' as const;
    if (status === 'unsafe' || status === 'not_cleared') return 'danger' as const;
    return 'unknown' as const;
  }, [result]);

  async function searchScanners() {
    setBusy(true);
    const { data, error } = await supabase.rpc('quickcheck_scanner_options');
    setBusy(false);
    if (error) return setResult({ status: 'unknown', display_status: 'SCANNER SEARCH ERROR', decision: error.message });
    const rows = (data ?? []) as ScannerOption[];
    const q = scannerSearch.trim().toLowerCase();
    setScanners(rows.filter((row) => !q || `${row.manufacturer} ${row.model} ${row.field_strength_t}`.toLowerCase().includes(q)).slice(0, 12));
  }

  async function searchDevices() {
    setBusy(true);
    const { data, error } = await supabase.rpc('quickcheck_search_devices', { p_search: deviceSearch.trim() });
    setBusy(false);
    if (error) return setResult({ status: 'unknown', display_status: 'DEVICE SEARCH ERROR', decision: error.message });
    setDevices(((data ?? []) as DeviceOption[]).slice(0, 20));
  }

  async function searchComponents() {
    if (!device) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('quickcheck_search_components', { p_device_id: device.id, p_search: componentSearch.trim() });
    setBusy(false);
    if (error) return setResult({ status: 'unknown', display_status: 'COMPONENT SEARCH ERROR', decision: error.message });
    setComponents(((data ?? []) as ComponentOption[]).slice(0, 30));
  }

  async function runCheck() {
    if (!scanner || !device) return;
    setBusy(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const payload = selectedComponents.map((item, index) => ({ component_id: item.id, slot: item.slot.trim() || `component_${index + 1}` }));
    const { data, error } = await supabase.rpc('quickcheck_run_exact_system_check_v3', {
      p_device_id: device.id,
      p_components: payload,
      p_scanner_model_id: scanner.id,
      p_scanner_strength_t: scanner.field_strength_t,
      p_scan_region: scanRegion,
      p_generator_serial_number: serialNumber.trim() || null,
      p_implant_metadata: {}
    });
    setBusy(false);
    setResult(error ? { status: 'unknown', display_status: 'QUICKCHECK ERROR', decision: error.message } : data);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 22 }}>
      <SectionTitle step="STEP 1" title="Select scanner" detail="Start with the scanner actually being used. Field strength is a hard compatibility input." />
      <SearchField value={scannerSearch} onChangeText={setScannerSearch} placeholder="Scanner make, model, or strength" />
      <Pressable onPress={searchScanners} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill }}>
        <Text style={{ color: palette.brand, fontWeight: '800' }}>Find scanners</Text>
      </Pressable>
      {scanners.map((item) => (
        <Pressable key={item.id} onPress={() => setScanner(item)} style={{ backgroundColor: scanner?.id === item.id ? palette.brandSoft : palette.surface, borderWidth: 1.5, borderColor: scanner?.id === item.id ? palette.brand : palette.line, borderRadius: radii.md, borderCurve: 'continuous', padding: 15, gap: 3 }}>
          <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>{item.manufacturer} {item.model}</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 14 }}>{item.field_strength_t}T</Text>
        </Pressable>
      ))}

      <View style={{ height: 1, backgroundColor: palette.line }} />
      <SectionTitle step="STEP 2" title="Identify implant" detail="Search the exact manufacturer and model. Similar families are never substituted." />
      <SearchField value={deviceSearch} onChangeText={setDeviceSearch} placeholder="Manufacturer, generator, pump, IPG, model" />
      <Pressable onPress={searchDevices} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill }}>
        <Text style={{ color: palette.brand, fontWeight: '800' }}>Search devices</Text>
      </Pressable>
      {devices.map((item) => (
        <Pressable key={item.id} onPress={() => { setDevice(item); setSelectedComponents([]); setComponents([]); }} style={{ backgroundColor: device?.id === item.id ? palette.brandSoft : palette.surface, borderWidth: 1.5, borderColor: device?.id === item.id ? palette.brand : palette.line, borderRadius: radii.md, borderCurve: 'continuous', padding: 15, gap: 3 }}>
          <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>{item.manufacturer ?? 'Manufacturer'} · {item.model ?? 'Model'}</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 13 }}>{item.family ?? item.device_type ?? 'Implantable device'}</Text>
        </Pressable>
      ))}

      {device ? (
        <>
          <View style={{ height: 1, backgroundColor: palette.line }} />
          <SectionTitle step="STEP 3" title="Exact components" detail="Add every implanted lead, extension, electrode, catheter, adapter, or accessory required by the manufacturer system definition." />
          <SearchField value={componentSearch} onChangeText={setComponentSearch} placeholder="Lead, extension, electrode, catheter…" />
          <Pressable onPress={searchComponents} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill }}>
            <Text style={{ color: palette.brand, fontWeight: '800' }}>Find components</Text>
          </Pressable>
          {components.map((item) => (
            <Pressable key={item.id} onPress={() => !selectedComponents.some((selected) => selected.id === item.id) && setSelectedComponents((current) => [...current, { ...item, slot: '' }])} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, padding: 14 }}>
              <Text selectable style={{ color: palette.text, fontWeight: '800' }}>{item.model}</Text>
              <Text selectable style={{ color: palette.muted, fontSize: 13 }}>{item.component_type}</Text>
            </Pressable>
          ))}
          {selectedComponents.map((item, index) => (
            <View key={`${item.id}-${index}`} style={{ backgroundColor: palette.brandSoft, borderRadius: radii.md, padding: 14, gap: 8 }}>
              <Text selectable style={{ color: palette.text, fontWeight: '800' }}>{item.model}</Text>
              <TextInput value={item.slot} onChangeText={(slot) => setSelectedComponents((current) => current.map((row, i) => i === index ? { ...row, slot } : row))} placeholder="Component slot (example: ra, rv_defib, lead_1)" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.surface, borderRadius: radii.sm, paddingHorizontal: 12, height: 44, color: palette.text }} />
            </View>
          ))}
        </>
      ) : null}

      <View style={{ height: 1, backgroundColor: palette.line }} />
      <SectionTitle step="STEP 4" title="Scan details" detail="Use the actual requested region and enter a generator serial when the labeling requires it." />
      <TextInput value={scanRegion} onChangeText={setScanRegion} placeholder="Scan region" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />
      <TextInput value={serialNumber} onChangeText={setSerialNumber} autoCapitalize="characters" placeholder="Generator serial number (when applicable)" placeholderTextColor={palette.muted} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />

      <Pressable disabled={!scanner || !device || busy} onPress={runCheck} style={{ opacity: !scanner || !device || busy ? 0.45 : 1, backgroundColor: palette.brand, minHeight: 58, borderRadius: radii.md, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(10,85,122,0.22)' }}>
        {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 17, fontWeight: '850' }}>Run MRI QuickCheck</Text>}
      </Pressable>

      {result ? (
        <StatusCard tone={tone} eyebrow={result.display_status ?? 'Result'} title={result.display_status ?? 'QuickCheck result'} detail={result.decision ?? result.reason ?? result.next_action}>
          {result.next_action ? <Text selectable style={{ color: palette.text, fontSize: 14, lineHeight: 20, fontWeight: '700' }}>{result.next_action}</Text> : null}
        </StatusCard>
      ) : null}
    </ScrollView>
  );
}
