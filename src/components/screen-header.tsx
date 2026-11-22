import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: type.size.xl,
    lineHeight: type.line.xl,
    fontWeight: type.weight.bold,
  },
  subtitle: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
});
