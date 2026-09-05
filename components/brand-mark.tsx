import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { palette } from '@/lib/theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 42 : 56;
  const radius = compact ? 14 : 18;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(10,85,122,0.22)'
        }}
      >
        <Image
          source={require('../assets/icon.png')}
          contentFit="cover"
          transition={150}
          style={{ width: size, height: size, borderRadius: radius }}
        />
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
