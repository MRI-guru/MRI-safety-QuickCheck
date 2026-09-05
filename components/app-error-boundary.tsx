import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { palette, radii } from '@/lib/theme';

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('MRI Safety QuickCheck render error', error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
  };

  private sendReport = async () => {
    const version = Constants.expoConfig?.version ?? 'unknown';
    const build = Constants.expoConfig?.ios?.buildNumber ?? 'unknown';
    const message = this.state.error?.message ?? 'Unknown error';
    const subject = encodeURIComponent(`MRI Safety QuickCheck Error - v${version} (${build})`);
    const body = encodeURIComponent(
      `Version: ${version}\nBuild: ${build}\nError: ${message}\n\nWhat were you doing when this happened?\n\nPlease do not include patient-identifying information.`
    );

    try {
      await Linking.openURL(`mailto:dballas88@gmail.com?subject=${subject}&body=${body}`);
    } catch {
      // Keep the fallback screen usable even if Mail is unavailable.
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%', maxWidth: 520, backgroundColor: palette.surface, borderRadius: radii.lg, padding: 22, gap: 14 }}>
          <Text selectable style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>Something went wrong</Text>
          <Text selectable style={{ color: palette.muted, fontSize: 14, lineHeight: 20 }}>
            MRI Safety QuickCheck encountered an unexpected app error. No MRI decision should be made from an incomplete or interrupted result.
          </Text>
          <Pressable onPress={this.retry} accessibilityRole="button" style={{ minHeight: 48, borderRadius: radii.md, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Try again</Text>
          </Pressable>
          <Pressable onPress={this.sendReport} accessibilityRole="button" style={{ minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: palette.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: palette.brand, fontWeight: '900' }}>Report this error</Text>
          </Pressable>
          <Text selectable style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
            Do not include patient names, dates of birth, medical record numbers, images, or other patient-identifying information in a report.
          </Text>
        </View>
      </View>
    );
  }
}
