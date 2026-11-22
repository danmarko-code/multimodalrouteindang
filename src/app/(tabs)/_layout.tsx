import { forwardRef, type ComponentRef } from 'react';

import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, touch, type } from '@/theme';

const tabs = [
  { name: 'search', href: '/', label: 'Search' },
  { name: 'terminals', href: '/terminals', label: 'Terminals' },
  { name: 'fares', href: '/fares', label: 'Fares' },
  { name: 'trends', href: '/trends', label: 'Trends' },
  { name: 'more', href: '/more', label: 'More' },
] as const;

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <Tabs>
        <TabSlot style={styles.slot} />
        <TabList asChild>
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <TabItem label={tab.label} />
              </TabTrigger>
            ))}
          </View>
        </TabList>
      </Tabs>
    </SafeAreaView>
  );
}

type TabItemProps = Omit<TabTriggerSlotProps, 'ref'> & { label: string };

const TabItem = forwardRef<ComponentRef<typeof Pressable>, TabItemProps>(function TabItem(
  { label, isFocused, ...props },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
      <View style={[styles.marker, isFocused && styles.markerActive]} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  slot: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.xs,
  },
  tabItem: {
    flex: 1,
    minHeight: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  marker: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  markerActive: {
    backgroundColor: colors.transit,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.medium,
  },
  tabLabelActive: {
    color: colors.ink,
    fontWeight: type.weight.semibold,
  },
});
