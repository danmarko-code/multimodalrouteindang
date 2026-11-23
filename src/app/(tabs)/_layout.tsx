import { forwardRef, type ComponentRef } from 'react';

import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  tabFaresSvg,
  tabMoreSvg,
  tabSearchSvg,
  tabTerminalsSvg,
  tabTrendsSvg,
} from '../../assets/svg';
import { SvgAsset } from '@/components/svg-asset';
import { colors, spacing, touch, type } from '@/theme';

const tabs = [
  { name: 'search', href: '/', label: 'Search', icon: tabSearchSvg },
  { name: 'terminals', href: '/terminals', label: 'Terminals', icon: tabTerminalsSvg },
  { name: 'fares', href: '/fares', label: 'Fares', icon: tabFaresSvg },
  { name: 'trends', href: '/trends', label: 'Trends', icon: tabTrendsSvg },
  { name: 'more', href: '/more', label: 'More', icon: tabMoreSvg },
] as const;

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Tabs>
        <TabSlot style={styles.slot} />
        <TabList asChild>
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <TabItem label={tab.label} icon={tab.icon} />
              </TabTrigger>
            ))}
          </View>
        </TabList>
      </Tabs>
    </SafeAreaView>
  );
}

type TabItemProps = Omit<TabTriggerSlotProps, 'ref'> & { label: string; icon: string };

const TabItem = forwardRef<ComponentRef<typeof Pressable>, TabItemProps>(function TabItem(
  { label, icon, isFocused, ...props },
  ref,
) {
  const tint = isFocused ? colors.transit : colors.muted;
  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
      <View style={[styles.marker, isFocused && styles.markerActive]} />
      <SvgAsset xml={icon} size={24} color={tint} />
      <Text numberOfLines={1} style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
        {label}
      </Text>
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
    minWidth: 0,
    minHeight: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
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
    color: colors.transit,
    fontWeight: type.weight.semibold,
  },
});
