import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = ScrollViewProps & {
  // Non-scrolling screens still need the same insets and horizontal padding.
  scroll?: boolean;
};

export function Screen({
  scroll = true,
  style,
  contentContainerStyle,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = { paddingTop: insets.top };

  if (!scroll) {
    return (
      <View style={[styles.nonScroll, styles.base, topInset, style]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.base, topInset, contentContainerStyle]}
      {...props}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  nonScroll: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  base: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
