import { useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';
import { StatusCard } from '@/components/status-card';

type ScannerOption = { id: string; manufacturer: string; model: string; field_strength_t: number };
type DeviceOption = { id: string; manufacturer?: string; model?: string; family?: string; device_type?: string };
type ComponentOption = { id: string; model?: string; component_type?: string };
type SelectedComponent = ComponentOption & { slot: string };

type GuidanceCondition = {
  id: string;
  mr_status?: string;
  field_strength_min_t?: number | null;
  field_strength_max_t?: number | null;
  scan_region?: string | null;
  max_spatial_gradient_g_cm?: number | null;
  max_slew_rate_t_m_s?: number | null;
  max_whole_body_sar_w_kg?: number | null;
  max_head_sar_w_kg?: number | null;
  max_b1_rms_ut?: number | null;
  coil_requirements?: string | null;
  operating_mode?: string | null;
  positioning_requirements?: string | null;
  programming_requirements?: string | null;
  monitoring_requirements?: string | null;
  lead_requirements?: string | null;
  other_conditions?: string | null;
  matches_selected_scanner?: boolean | null;
  source?: { title?: string; document_version?: string; effective_date?: string };
};

function SectionTitle({ step, title, detail }: { step: string; title: string; detail: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text selectable style={{ color: palette.brand, fontSize: 12, fontWeight: '800', letterSpacing: 0.7 }}>{step}</Text>
      <Text selectable style={{ color: palette.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.4 }}>{title}</Text>
      <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>{detail}</Text>
    </View>
  );
}

function SearchField({ value, onChangeText, placeholder, onSubmit }: { value: string; onChangeText: (value: string) => void; placeholder: string; onSubmit?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, borderCurve: 'continuous', paddingHorizontal: 14 }}>
      <Image source="sf:magnifyingglass" style={{ width: 18, height: 18 }} tintColor={palette.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        returnKeyType={onSubmit ? 'search' : 'done'}
        onSubmitEditing={() => { Keyboard.dismiss(); onSubmit?.(); }}
        style={{ flex: 1, height: 50, color: palette.text, fontSize: 16 }}
      />
    </View>
  );
}

function conditionLine(label: string, value?: string | number | null) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Text key={label} selectable style={{ color: palette.text, fontSize: 13, lineHeight: 19 }}>
      <Text style={{ fontWeight: '800' }}>{label}: </Text>{String(value)}
    </Text>
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
    if (status === 'conditional' || status === 'guidance') return 'conditional' as const;
    if (status === 'unsafe' || status === 'not_cleared') return 'danger' as const;
    return 'unknown' as const;
  }, [result]);

  async function searchScanners() {
    Keyboard.dismiss();
    setBusy(true);
    const { data, error } = await supabase.rpc('quickcheck_scanner_options');
    setBusy(false);
    if (error) return setResult({ status: 'unknown', display_status: 'SCANNER SEARCH ERROR', decision: error.message });
    const rows = (data ?? []) as ScannerOption[];
    const q = scannerSearch.trim().toLowerCase();
    setScanners(rows.filter((row) => !q || `${row.manufacturer} ${row.model} ${row.field_strength_t}`.toLowerCase().includes(q)).slice(0, 12));
  }

  async function searchDevices() {
    Keyboard.dismiss();
    setBusy(true);
    const { data, error } = await supabase.rpc('quickcheck_search_devices', { p_search: deviceSearch.trim() });
    setBusy(false);
    if (error) return setResult({ status: 'unknown', display_status: 'DEVICE SEARCH ERROR', decision: error.message });
    setDevices(((data ?? []) as DeviceOption[]).slice(0, 20));
  }

  async function searchComponents() {
    Keyboard.dismiss();
    if (!device) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('quickcheck_search_components', { p_device_id: device.id, p_search: componentSearch.trim() });
    setBusy(false);
    if (error) return setResult({ status: 'unknown', display_status: 'COMPONENT SEARCH ERROR', decision: error.message });
    setComponents(((data ?? []) as ComponentOption[]).slice(0, 30));
  }

  async function runCheck() {
    Keyboard.dismiss();
    if (!device) return;
    setBusy(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    let data: any = null;
    let error: any = null;

    if (scanner && selectedComponents.length > 0) {
      const payload = selectedComponents.map((item, index) => ({ component_id: item.id, slot: item.slot.trim() || `component_${index + 1}` }));
      const response = await supabase.rpc('quickcheck_run_exact_system_check_v3', {
        p_device_id: device.id,
        p_components: payload,
        p_scanner_model_id: scanner.id,
        p_scanner_strength_t: scanner.field_strength_t,
        p_scan_region: scanRegion,
        p_generator_serial_number: serialNumber.trim() || null,
        p_implant_metadata: {}
      });
      data = response.data;
      error = response.error;
    } else {
      const response = await supabase.rpc('quickcheck_get_device_guidance', {
        p_device_id: device.id,
        p_scanner_strength_t: scanner?.field_strength_t ?? null,
        p_scan_region: scanRegion.trim() || null
      });
      data = response.data;
      error = response.error;
    }

    setBusy(false);
    setResult(error ? { status: 'unknown', display_status: 'QUICKCHECK ERROR', decision: error.message } : data);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 22 }}
    >
      <SectionTitle step="OPTIONAL" title="Select scanner" detail="Optional for fast guideline lookup. Add the actual scanner when known to compare the labeling against field strength." />
      <SearchField value={scannerSearch} onChangeText={setScannerSearch} placeholder="Scanner make, model, or strength" onSubmit={searchScanners} />
      <Pressable onPress={searchScanners} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill }}>
        <Text style={{ color: palette.brand, fontWeight: '800' }}>Find scanners</Text>
      </Pressable>
      {scanner ? (
        <Pressable onPress={() => setScanner(null)} style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 1, borderColor: palette.line }}>
          <Text style={{ color: palette.muted, fontWeight: '700' }}>Clear scanner selection</Text>
        </Pressable>
      ) : null}
      {scanners.map((item) => (
        <Pressable key={item.id} onPress={() => setScanner(item)} style={{ backgroundColor: scanner?.id === item.id ? palette.brandSoft : palette.surface, borderWidth: 1.5, borderColor: scanner?.id === item.id ? palette.brand : palette.line, borderRadius: radii.md, borderCurve: 'continuous', padding: 15, gap: 3 }}>
          <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>{item.manufacturer} {item.model}</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 14 }}>{item.field_strength_t}T</Text>
        </Pressable>
      ))}

      <View style={{ height: 1, backgroundColor: palette.line }} />
      <SectionTitle step="REQUIRED" title="Identify implant" detail="Select the manufacturer and model. This is enough to open the current manufacturer MRI guidance." />
      <SearchField value={deviceSearch} onChangeText={setDeviceSearch} placeholder="Manufacturer, generator, pump, IPG, model" onSubmit={searchDevices} />
      <Pressable onPress={searchDevices} style={{ alignSelf: 'flex-start', backgroundColor: palette.brandSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill }}>
        <Text style={{ color: palette.brand, fontWeight: '800' }}>Search devices</Text>
      </Pressable>
      {devices.map((item) => (
        <Pressable key={item.id} onPress={() => { setDevice(item); setSelectedComponents([]); setComponents([]); setResult(null); }} style={{ backgroundColor: device?.id === item.id ? palette.brandSoft : palette.surface, borderWidth: 1.5, borderColor: device?.id === item.id ? palette.brand : palette.line, borderRadius: radii.md, borderCurve: 'continuous', padding: 15, gap: 3 }}>
          <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>{item.manufacturer ?? 'Manufacturer'} · {item.model ?? 'Model'}</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 13 }}>{item.family ?? item.device_type ?? 'Implantable device'}</Text>
        </Pressable>
      ))}

      {device ? (
        <>
          <View style={{ height: 1, backgroundColor: palette.line }} />
          <SectionTitle step="OPTIONAL" title="Exact components" detail="Optional for guideline lookup. Add leads, extensions, electrodes, catheters, adapters, or accessories when known to run an exact-system verification." />
          <SearchField value={componentSearch} onChangeText={setComponentSearch} placeholder="Lead, extension, electrode, catheter…" onSubmit={searchComponents} />
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
              <TextInput
                value={item.slot}
                onChangeText={(slot) => setSelectedComponents((current) => current.map((row, i) => i === index ? { ...row, slot } : row))}
                placeholder="Component slot (example: ra, rv_defib, lead_1)"
                placeholderTextColor={palette.muted}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{ backgroundColor: palette.surface, borderRadius: radii.sm, paddingHorizontal: 12, height: 44, color: palette.text }}
              />
              <Pressable onPress={() => setSelectedComponents((current) => current.filter((_, i) => i !== index))}>
                <Text style={{ color: palette.danger, fontSize: 12, fontWeight: '800' }}>Remove component</Text>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      <View style={{ height: 1, backgroundColor: palette.line }} />
      <SectionTitle step="SCAN DETAILS" title="MRI scan details" detail="These details are available even when exact implanted components are unknown." />
      <TextInput value={scanRegion} onChangeText={setScanRegion} placeholder="Scan region" placeholderTextColor={palette.muted} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />
      <TextInput value={serialNumber} onChangeText={setSerialNumber} autoCapitalize="characters" placeholder="Generator serial number (optional)" placeholderTextColor={palette.muted} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, paddingHorizontal: 14, height: 50, color: palette.text, fontSize: 16 }} />

      <Pressable disabled={!device || busy} onPress={runCheck} style={{ opacity: !device || busy ? 0.45 : 1, backgroundColor: palette.brand, minHeight: 58, borderRadius: radii.md, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(10,85,122,0.22)' }}>
        {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 17, fontWeight: '900' }}>{scanner && selectedComponents.length > 0 ? 'Run Exact MRI QuickCheck' : 'View Manufacturer MRI Guidance'}</Text>}
      </Pressable>

      {result ? (
        <StatusCard tone={tone} eyebrow={result.display_status ?? 'Result'} title={result.display_status ?? 'QuickCheck result'} detail={result.decision ?? result.reason ?? result.next_action}>
          {result.guidance_mode ? (
            <View style={{ backgroundColor: palette.bg, borderRadius: radii.md, padding: 12, gap: 5 }}>
              <Text selectable style={{ color: palette.text, fontSize: 13, fontWeight: '900' }}>GUIDANCE MODE — NOT SCAN CLEARANCE</Text>
              <Text selectable style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>Exact implanted components have not been verified. Use the manufacturer conditions below to identify the applicable pathway, then add components when available.</Text>
            </View>
          ) : null}
          {result.next_action ? <Text selectable style={{ color: palette.text, fontSize: 14, lineHeight: 20, fontWeight: '700' }}>{result.next_action}</Text> : null}
        </StatusCard>
      ) : null}

      {Array.isArray(result?.conditions) ? (result.conditions as GuidanceCondition[]).map((condition) => (
        <View key={condition.id} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: condition.matches_selected_scanner === false ? palette.danger : palette.line, borderRadius: radii.md, padding: 15, gap: 6 }}>
          <Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: '900' }}>
            {condition.mr_status ? `MR ${condition.mr_status.toUpperCase()}` : 'Manufacturer condition'}
          </Text>
          {conditionLine('Field strength', condition.field_strength_min_t === condition.field_strength_max_t ? `${condition.field_strength_min_t}T` : `${condition.field_strength_min_t ?? '?'}–${condition.field_strength_max_t ?? '?'}T`)}
          {conditionLine('Scan region', condition.scan_region)}
          {conditionLine('Whole-body SAR max', condition.max_whole_body_sar_w_kg != null ? `${condition.max_whole_body_sar_w_kg} W/kg` : null)}
          {conditionLine('Head SAR max', condition.max_head_sar_w_kg != null ? `${condition.max_head_sar_w_kg} W/kg` : null)}
          {conditionLine('B1+rms max', condition.max_b1_rms_ut != null ? `${condition.max_b1_rms_ut} µT` : null)}
          {conditionLine('Spatial gradient max', condition.max_spatial_gradient_g_cm != null ? `${condition.max_spatial_gradient_g_cm} G/cm` : null)}
          {conditionLine('Slew rate max', condition.max_slew_rate_t_m_s != null ? `${condition.max_slew_rate_t_m_s} T/m/s` : null)}
          {conditionLine('Operating mode', condition.operating_mode)}
          {conditionLine('Coil', condition.coil_requirements)}
          {conditionLine('Positioning', condition.positioning_requirements)}
          {conditionLine('Programming', condition.programming_requirements)}
          {conditionLine('Monitoring', condition.monitoring_requirements)}
          {conditionLine('Lead/system requirements', condition.lead_requirements)}
          {conditionLine('Other conditions', condition.other_conditions)}
          {condition.source?.title ? (
            <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }}>
              Source: {condition.source.title}{condition.source.document_version ? ` · ${condition.source.document_version}` : ''}{condition.source.effective_date ? ` · ${condition.source.effective_date}` : ''}
            </Text>
          ) : null}
        </View>
      )) : null}
    </ScrollView>
  );
}
