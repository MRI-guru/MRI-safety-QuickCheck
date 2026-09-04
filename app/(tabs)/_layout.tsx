import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { palette } from '@/lib/theme';

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Image source={`sf:${name}`} style={{ width: 23, height: 23 }} tintColor={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.bg },
        headerShadowVisible: false,
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.line }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'QuickCheck', tabBarIcon: ({ color }) => <TabIcon name="shield.checkered" color={color} /> }}
      />
      <Tabs.Screen
        name="scanners"
        options={{ title: 'Scanners', tabBarIcon: ({ color }) => <TabIcon name="wave.3.right.circle" color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ color }) => <TabIcon name="clock.arrow.circlepath" color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <TabIcon name="gearshape.fill" color={color} /> }}
      />
    </Tabs>
  );
}
