import { StyleSheet, Text, View } from 'react-native';

import { SvgAsset } from '@/components/svg-asset';
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
  icon?: string;
};

export function Badge({ label, tone = 'muted', icon }: BadgeProps) {
  const solid = tone !== 'muted';
  const textColor = solid ? colors.onTransit : colors.muted;
  return (
    <View
      style={[
        styles.badge,
        solid
          ? { backgroundColor: solidTones[tone] }
          : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
      ]}>
      {icon ? <SvgAsset xml={icon} size={14} color={textColor} /> : null}
      <Text numberOfLines={1} style={[styles.label, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  label: {
    flexShrink: 0,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
    letterSpacing: 0.3,
  },
});
