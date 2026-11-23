import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { formatClock, terminals, type Terminal } from '@/data/indang';
import { useLive, type QueueLevel, type TerminalStatus } from '@/data/live';
import { colors, radii, spacing, touch, type } from '@/theme';

type Filter = 'all' | 'jeepney' | 'tricycle';
type Crowd = 'light' | 'moderate' | 'heavy';

// The theme has no red token; Heavy needs one for the bar and badge.
const HEAVY_COLOR = '#B42318';
const QUEUE_LEVELS: QueueLevel[] = ['none', '1-5', '6-15', '16+'];

const CROWD_OF: Record<QueueLevel, Crowd> = {
  none: 'light',
  '1-5': 'light',
  '6-15': 'moderate',
  '16+': 'heavy',
};

const CROWD_META: Record<Crowd, { label: string; color: string; fill: number }> = {
  light: { label: 'Light', color: colors.transit, fill: 0.25 },
  moderate: { label: 'Moderate', color: colors.fare, fill: 0.6 },
  heavy: { label: 'Heavy', color: HEAVY_COLOR, fill: 0.9 },
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'jeepney', label: 'Jeepney' },
  { value: 'tricycle', label: 'Tricycle' },
];

type Row = { terminal: Terminal; status: TerminalStatus; open: boolean };

const minutesOf = (clock: string) => {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
};

function isOpen(terminal: Terminal, now: Date): boolean {
  const hours = terminal.operatingHours;
  if (!hours) return true;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= minutesOf(hours.opensAt) && minutes <= minutesOf(hours.closesAt);
}

function displayName(name: string): string {
  return name.replace('Poblacion', 'Indang Bayan');
}

function modeLabel(terminal: Terminal): string {
  return terminal.mode === 'jeepney' ? 'Jeepney' : 'Tricycle';
}

function reportedText(minutesAgo: number): string {
  return minutesAgo === 0 ? 'Reported just now' : `Reported ${minutesAgo} min ago`;
}

function compareRows(a: Row, b: Row): number {
  if (a.open !== b.open) return a.open ? -1 : 1;
  if (a.status.isStale !== b.status.isStale) return a.status.isStale ? 1 : -1;
  const queueDelta =
    QUEUE_LEVELS.indexOf(a.status.queueLevel) - QUEUE_LEVELS.indexOf(b.status.queueLevel);
  if (queueDelta !== 0) return queueDelta;
  const waitDelta = a.status.waitMinutes - b.status.waitMinutes;
  if (waitDelta !== 0) return waitDelta;
  return a.terminal.name.localeCompare(b.terminal.name);
}

function LeastCrowdedCard({ row }: { row: Row }) {
  const { terminal, status } = row;
  const meta = CROWD_META[CROWD_OF[status.queueLevel]];

  return (
    <Card style={styles.topCard}>
      <Text style={styles.topLabel}>Least crowded now</Text>
      <View style={styles.topNameRow}>
        <Text style={styles.topName}>{displayName(terminal.name)}</Text>
        <View style={styles.topChip}>
          <Badge label={modeLabel(terminal)} tone="muted" />
        </View>
      </View>
      <Text style={[styles.topWait, status.isStale && styles.dimmed]}>
        {status.isStale
          ? 'No recent report'
          : `~${status.waitMinutes} min wait · ${meta.label}`}
      </Text>
      <Text style={styles.topReported}>{reportedText(status.minutesAgo)}</Text>
    </Card>
  );
}

function RankedRow({ row, rank }: { row: Row; rank: number }) {
  const { terminal, status, open } = row;
  const meta = CROWD_META[CROWD_OF[status.queueLevel]];
  const fill = meta.fill;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/report', params: { terminalId: terminal.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${displayName(terminal.name)}, rank ${rank}. Report wait time`}
      style={({ pressed }) => [styles.row, !open && styles.rowClosed, pressed && styles.pressed]}>
      <View style={styles.rowTop}>
        <Text style={styles.rank}>{String(rank)}</Text>
        <View style={styles.rowNameWrap}>
          <Text style={styles.rowName} numberOfLines={2}>
            {displayName(terminal.name)}
          </Text>
          <Badge
            label={modeLabel(terminal)}
            tone={terminal.mode === 'jeepney' ? 'route' : 'fare'}
          />
        </View>
        <Badge label={open ? 'Open' : 'Closed'} tone={open ? 'transit' : 'muted'} />
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${fill * 100}%`,
              backgroundColor: status.isStale ? colors.muted : meta.color,
            },
          ]}
        />
      </View>

      <View style={styles.rowBottom}>
        <Text style={[styles.rowWait, (status.isStale || !open) && styles.dimmed]}>
          {`~${status.waitMinutes} min wait`}
        </Text>
        {status.isStale ? (
          <Text style={styles.noReport}>No recent report</Text>
        ) : (
          <View style={[styles.crowdBadge, { backgroundColor: meta.color }]}>
            <Text style={styles.crowdText}>{meta.label}</Text>
          </View>
        )}
      </View>
      <Text style={styles.rowReported}>{reportedText(status.minutesAgo)}</Text>
    </Pressable>
  );
}

export default function TrendsScreen() {
  const { getTerminalStatus } = useLive();
  const [filter, setFilter] = useState<Filter>('all');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const rows: Row[] = terminals
    .map((terminal) => ({
      terminal,
      status: getTerminalStatus(terminal.id),
      open: isOpen(terminal, now),
    }))
    .filter((row): row is Row => row.status !== undefined)
    .sort(compareRows);

  const visible = rows.filter((row) => filter === 'all' || row.terminal.mode === filter);
  const fresh = visible.filter((row) => row.open && !row.status.isStale);
  const best = (fresh.length > 0 ? fresh : visible)[0];

  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <Screen contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Trends" subtitle={`Right now · ${formatClock(clock)}`} />

        <View style={styles.filterRow}>
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setFilter(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {best ? <LeastCrowdedCard row={best} /> : null}

        <View style={styles.list}>
          {visible.map((row, index) => (
            <Card key={row.terminal.id} style={styles.rowCard}>
              <RankedRow row={row} rank={index + 1} />
            </Card>
          ))}
          <Text style={styles.caption}>
            Based on commuter reports from the last 30 minutes.
          </Text>
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    minHeight: touch.min,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.transit,
    borderColor: colors.transit,
  },
  filterText: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.medium,
  },
  filterTextActive: {
    color: colors.onTransit,
    fontWeight: type.weight.semibold,
  },
  topCard: {
    backgroundColor: colors.transit,
    borderColor: colors.transit,
    gap: spacing.sm,
  },
  topLabel: {
    color: colors.onTransit,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
    letterSpacing: 0.3,
  },
  topNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topName: {
    flex: 1,
    color: colors.onTransit,
    fontSize: type.size.lg,
    lineHeight: type.line.lg,
    fontWeight: type.weight.bold,
  },
  topChip: {
    flexShrink: 0,
  },
  topWait: {
    color: colors.onTransit,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.semibold,
  },
  topReported: {
    color: colors.onTransit,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    opacity: 0.85,
  },
  list: {
    gap: spacing.md,
  },
  rowCard: {
    padding: spacing.md,
  },
  row: {
    minHeight: touch.min,
    gap: spacing.sm,
  },
  rowClosed: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rank: {
    width: spacing.xl,
    color: colors.muted,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.bold,
  },
  rowNameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowName: {
    flexShrink: 1,
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.semibold,
  },
  barTrack: {
    height: spacing.xs + 2,
    borderRadius: radii.sm,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.sm,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowWait: {
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.semibold,
  },
  crowdBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  crowdText: {
    color: colors.onTransit,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
  },
  noReport: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  dimmed: {
    opacity: 0.5,
  },
  rowReported: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  caption: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    textAlign: 'center',
  },
});
