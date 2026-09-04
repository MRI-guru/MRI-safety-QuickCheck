import { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { palette, radii, toneColors, type QuickCheckTone } from '@/lib/theme';

const iconByTone: Record<QuickCheckTone, string> = {
  safe: 'checkmark.shield.fill',
  conditional: 'exclamationmark.triangle.fill',
  danger: 'xmark.octagon.fill',
  unknown: 'questionmark.diamond.fill'
};

export function StatusCard({
  tone,
  eyebrow,
  title,
  detail,
  children
}: {
  tone: QuickCheckTone;
  eyebrow: string;
  title: string;
  detail?: string;
  children?: ReactNode;
}) {
  const colors = toneColors(tone);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: radii.lg,
        borderCurve: 'continuous',
        padding: 20,
        gap: 14,
        borderWidth: 1,
        borderColor: `${colors.foreground}24`
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 15,
            borderCurve: 'continuous',
            backgroundColor: colors.foreground,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image source={`sf:${iconByTone[tone]}`} style={{ width: 25, height: 25 }} tintColor={palette.white} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text selectable style={{ color: colors.foreground, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 }}>
            {eyebrow.toUpperCase()}
          </Text>
          <Text selectable style={{ color: palette.text, fontSize: 21, lineHeight: 25, fontWeight: '800', letterSpacing: -0.4 }}>
            {title}
          </Text>
        </View>
      </View>
      {detail ? (
        <Text selectable style={{ color: palette.text, fontSize: 15, lineHeight: 21 }}>
          {detail}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
