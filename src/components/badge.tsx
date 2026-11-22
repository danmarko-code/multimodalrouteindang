import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, type } from '@/theme';

type BadgeTone = 'transit' | 'route' | 'fare' | 'muted';

const solidTones: Record<Exclude<BadgeTone, 'muted'>, string> = {
  transit: colors.transit,
  route: colors.route,
  fare: colors.fare,
};

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'muted' }: BadgeProps) {
  const solid = tone !== 'muted';
  return (
    <View
      style={[
        styles.badge,
        solid
          ? { backgroundColor: solidTones[tone] }
          : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
      ]}>
      <Text style={[styles.label, { color: solid ? colors.onTransit : colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  label: {
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
    letterSpacing: 0.3,
  },
});
