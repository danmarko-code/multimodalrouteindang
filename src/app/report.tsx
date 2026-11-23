import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MODE_SVG } from '../assets/svg';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { terminals, type Terminal } from '@/data/indang';
import { useLive, type QueueLevel } from '@/data/live';
import { colors, radii, spacing, touch, type } from '@/theme';

const QUEUE_OPTIONS: { label: string; value: QueueLevel }[] = [
  { label: 'No queue', value: 'none' },
  { label: '1 to 5', value: '1-5' },
  { label: '6 to 15', value: '6-15' },
  { label: '16 or more', value: '16+' },
];
const WAIT_OPTIONS: { label: string; value: number }[] = [
  { label: 'Under 5 min', value: 2 },
  { label: '5 to 10 min', value: 8 },
  { label: '10 to 20 min', value: 15 },
  { label: '20 to 30 min', value: 25 },
  { label: 'over 30 min', value: 35 },
];

function displayName(name: string): string {
  return name.replace('Poblacion', 'Indang Bayan');
}

function modeLabel(terminal: Terminal): string {
  return terminal.mode === 'jeepney' ? 'Jeepney' : 'Tricycle';
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function LocationStatus({ terminal }: { terminal: Terminal }) {
  if (terminal.distanceMeters > 50) {
    return (
      <Card style={styles.statusCard}>
        <Text style={styles.warning}>Move within 50 m of the terminal to report</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.statusCard}>
      <View style={styles.statusRow}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.statusText}>
          {`Within 50 m of ${displayName(terminal.name)}`}
        </Text>
      </View>
      <Text style={styles.distance}>
        {`You are ${terminal.distanceMeters} m from the terminal`}
      </Text>
    </Card>
  );
}

export default function ReportScreen() {
  const { terminalId } = useLocalSearchParams<{ terminalId?: string }>();
  const terminal = terminals.find((item) => item.id === terminalId);
  const { submitReport } = useLive();
  const [queue, setQueue] = useState<(typeof QUEUE_OPTIONS)[number] | null>(null);
  const [wait, setWait] = useState<(typeof WAIT_OPTIONS)[number] | null>(null);
  const [summary, setSummary] = useState<{ queue: string; wait: string } | null>(null);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/terminals');
    }
  };

  if (!terminal) {
    return (
      <Screen scroll={false}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <ScreenHeader title="Report wait time" />
        <Text style={styles.missing}>Terminal not found.</Text>
      </Screen>
    );
  }

  const tooFar = terminal.distanceMeters > 50;
  const canSubmit = queue !== null && wait !== null && !tooFar;

  const submit = () => {
    if (queue === null || wait === null || tooFar) return;
    submitReport(terminal.id, queue.value, wait.value);
    setSummary({ queue: queue.label, wait: wait.label });
  };

  return (
    <Screen contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <ScreenHeader title="Report wait time" />

        <View style={styles.terminalRow}>
          <Text style={styles.terminalName}>{displayName(terminal.name)}</Text>
          <View style={styles.modeChip}>
            <Badge
              label={modeLabel(terminal)}
              tone={terminal.mode === 'jeepney' ? 'route' : 'fare'}
              icon={MODE_SVG[terminal.mode]}
            />
          </View>
        </View>

        {summary ? (
          <Card style={styles.successCard}>
            <View style={styles.successCircle}>
              <Text style={styles.successMark}>✓</Text>
            </View>
            <Text style={styles.successTitle}>
              Thanks, your report is live for 30 minutes
            </Text>
            <Text style={styles.successSummary}>
              {`Queue: ${summary.queue} · Wait: ${summary.wait}`}
            </Text>
            <View style={styles.successButton}>
              <Button label="Back to terminals" onPress={() => router.replace('/terminals')} />
            </View>
          </Card>
        ) : (
          <>
            <LocationStatus terminal={terminal} />

            <View style={styles.question}>
              <Text style={styles.questionLabel}>How many people are in the queue?</Text>
              <View style={styles.chipRow}>
                {QUEUE_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option.label}
                    label={option.label}
                    selected={queue?.value === option.value}
                    onPress={() => setQueue(option)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.question}>
              <Text style={styles.questionLabel}>How long did you wait?</Text>
              <View style={styles.chipRow}>
                {WAIT_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option.label}
                    label={option.label}
                    selected={wait?.value === option.value}
                    onPress={() => setWait(option)}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.expiry}>Reports expire after 30 minutes.</Text>

            <View style={styles.submitWrap}>
              <Button label="Submit report" onPress={submit} disabled={!canSubmit} />
            </View>
          </>
        )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: touch.min,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  backText: {
    color: colors.transit,
    fontSize: type.size.sm,
    fontWeight: type.weight.semibold,
  },
  pressed: {
    opacity: 0.7,
  },
  missing: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
  terminalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  terminalName: {
    flex: 1,
    color: colors.ink,
    fontSize: type.size.lg,
    lineHeight: type.line.lg,
    fontWeight: type.weight.bold,
  },
  modeChip: {
    flexShrink: 0,
  },
  statusCard: {
    gap: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transit,
  },
  checkMark: {
    color: colors.onTransit,
    fontSize: type.size.xs,
    fontWeight: type.weight.bold,
  },
  statusText: {
    flex: 1,
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.medium,
  },
  distance: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  warning: {
    color: colors.fare,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.semibold,
  },
  question: {
    gap: spacing.sm,
  },
  questionLabel: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.semibold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: touch.min,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.transit,
    borderColor: colors.transit,
  },
  chipText: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.medium,
  },
  chipTextSelected: {
    color: colors.onTransit,
    fontWeight: type.weight.semibold,
  },
  expiry: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  submitWrap: {
  },
  successCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  successCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transit,
  },
  successMark: {
    color: colors.onTransit,
    fontSize: type.size.lg,
    fontWeight: type.weight.bold,
  },
  successTitle: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.bold,
    textAlign: 'center',
  },
  successSummary: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    textAlign: 'center',
  },
  successButton: {
    alignSelf: 'stretch',
  },
});
