import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { palette, radii } from '@/lib/theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: compact ? 42 : 56,
          height: compact ? 42 : 56,
          borderRadius: compact ? 14 : 18,
          borderCurve: 'continuous',
          backgroundColor: palette.brand,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(10,85,122,0.22)'
        }}
      >
        <Image source="sf:waveform.path.ecg.rectangle.fill" style={{ width: compact ? 24 : 32, height: compact ? 24 : 32 }} tintColor={palette.white} />
      </View>
      {!compact && (
        <View style={{ gap: 2 }}>
          <Text selectable style={{ color: palette.text, fontSize: 23, fontWeight: '800', letterSpacing: -0.6 }}>
            MRI Safety
          </Text>
          <Text selectable style={{ color: palette.brand, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 }}>
            QUICKCHECK
          </Text>
        </View>
      )}
    </View>
  );
}
