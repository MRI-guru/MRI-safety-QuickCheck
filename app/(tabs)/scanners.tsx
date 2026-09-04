import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { palette, radii } from '@/lib/theme';

type Profile = {
  id: string;
  manufacturer: string;
  model: string;
  field_strength_t: number;
  nickname?: string | null;
  is_default: boolean;
};

export default function ScannersScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [strength, setStrength] = useState('1.5');
  const [nickname, setNickname] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const { data, error } = await supabase.rpc('quickcheck_list_scanner_profiles');
    if (error) setMessage(error.message);
    else setProfiles((data ?? []) as Profile[]);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!manufacturer.trim() || !model.trim() || !Number(strength)) return;
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('quickcheck_save_scanner_profile', {
      p_id: null,
      p_manufacturer: manufacturer.trim(),
      p_model: model.trim(),
      p_field_strength_t: Number(strength),
      p_nickname: nickname.trim() || null,
      p_is_default: isDefault
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setManufacturer(''); setModel(''); setNickname('');
    setMessage('Scanner saved.');
    load();
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 18 }}>
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: palette.text, fontSize: 28, fontWeight: '850', letterSpacing: -0.8 }}>Your MRI scanners</Text>
        <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>Save the scanner make, model, and field strength used at your facility. QuickCheck carries this profile into the audit record.</Text>
      </View>

      {profiles.map((profile) => (
        <View key={profile.id} style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 17, gap: 10, borderWidth: profile.is_default ? 1.5 : 1, borderColor: profile.is_default ? palette.brand : palette.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Image source="sf:wave.3.right.circle.fill" style={{ width: 25, height: 25 }} tintColor={palette.brand} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: '800' }}>{profile.nickname || `${profile.manufacturer} ${profile.model}`}</Text>
              <Text selectable style={{ color: palette.muted, fontSize: 13 }}>{profile.manufacturer} {profile.model} · {profile.field_strength_t}T</Text>
            </View>
            {profile.is_default ? <Text style={{ color: palette.brand, fontSize: 11, fontWeight: '850' }}>DEFAULT</Text> : null}
          </View>
        </View>
      ))}

      <View style={{ backgroundColor: palette.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: 18, gap: 13, boxShadow: '0 6px 20px rgba(20,33,43,0.06)' }}>
        <Text selectable style={{ color: palette.text, fontSize: 19, fontWeight: '800' }}>Add scanner</Text>
        {[['Manufacturer', manufacturer, setManufacturer, 'Siemens Healthineers'], ['Model', model, setModel, 'MAGNETOM Vida'], ['Nickname', nickname, setNickname, 'Southlake 3T']].map(([label, value, setter, placeholder]) => (
          <View key={label as string} style={{ gap: 6 }}>
            <Text selectable style={{ color: palette.muted, fontSize: 12, fontWeight: '750' }}>{label as string}</Text>
            <TextInput value={value as string} onChangeText={setter as (text: string) => void} placeholder={placeholder as string} placeholderTextColor={palette.muted} style={{ backgroundColor: palette.bg, height: 48, borderRadius: radii.md, paddingHorizontal: 13, color: palette.text, fontSize: 15 }} />
          </View>
        ))}
        <View style={{ gap: 6 }}>
          <Text selectable style={{ color: palette.muted, fontSize: 12, fontWeight: '750' }}>Field strength (T)</Text>
          <TextInput value={strength} onChangeText={setStrength} keyboardType="decimal-pad" style={{ backgroundColor: palette.bg, height: 48, borderRadius: radii.md, paddingHorizontal: 13, color: palette.text, fontSize: 15 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text selectable style={{ color: palette.text, fontSize: 15, fontWeight: '750' }}>Default scanner</Text>
            <Text selectable style={{ color: palette.muted, fontSize: 12 }}>Use first when starting a QuickCheck.</Text>
          </View>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>
        <Pressable disabled={busy} onPress={save} style={{ backgroundColor: palette.brand, minHeight: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? <ActivityIndicator color={palette.white} /> : <Text style={{ color: palette.white, fontSize: 16, fontWeight: '850' }}>Save scanner</Text>}
        </Pressable>
        {message ? <Text selectable style={{ color: message === 'Scanner saved.' ? palette.safe : palette.danger, fontSize: 13 }}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}
