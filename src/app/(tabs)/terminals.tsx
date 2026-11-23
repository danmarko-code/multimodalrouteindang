import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { formatClock, terminals, type Terminal } from '@/data/indang';
import { useLive, type QueueLevel } from '@/data/live';
import { colors, radii, spacing, touch, type } from '@/theme';

type ViewMode = 'list' | 'map';
type Filter = 'all' | 'jeepney' | 'tricycle' | 'open';
type Congestion = 'light' | 'moderate' | 'heavy';

// The theme has no red token; Heavy needs one for the wait badge and map pin.
const HEAVY_COLOR = '#B42318';

const CONGESTION_META: Record<Congestion, { label: string; color: string }> = {
  light: { label: 'Light', color: colors.transit },
  moderate: { label: 'Moderate', color: colors.fare },
  heavy: { label: 'Heavy', color: HEAVY_COLOR },
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'jeepney', label: 'Jeepney' },
  { value: 'tricycle', label: 'Tricycle' },
  { value: 'open', label: 'Open now' },
];

const MAP_HEIGHT = 300;
const MAP_PAD = 28;
const LABEL_HEIGHT = 12;
const LABEL_CHAR = 5.6;

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

function congestionOfQueue(queueLevel: QueueLevel): Congestion {
  if (queueLevel === 'none' || queueLevel === '1-5') return 'light';
  if (queueLevel === '6-15') return 'moderate';
  return 'heavy';
}

function displayName(name: string): string {
  return name.replace('Poblacion', 'Indang Bayan');
}

function shortName(name: string): string {
  return displayName(name).replace(/ (Terminal|Stop)$/, '');
}

type SegmentOption<T extends string> = { value: T; label: string };

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && styles.segmentItemActive]}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CongestionPill({ congestion }: { congestion: Congestion }) {
  const meta = CONGESTION_META[congestion];
  return (
    <View style={[styles.congestion, { backgroundColor: meta.color }]}>
      <Text style={styles.congestionText}>{meta.label}</Text>
    </View>
  );
}

function TerminalCard({ terminal, open }: { terminal: Terminal; open: boolean }) {
  const { getTerminalStatus } = useLive();
  const status = getTerminalStatus(terminal.id);
  const waitMinutes = status?.waitMinutes ?? terminal.waitMinutes;
  const reportsToday = status?.reportsToday ?? terminal.reportsToday;
  const minutesAgo = status?.minutesAgo ?? terminal.lastReportMinutesAgo;
  const isStale = status?.isStale ?? false;
  const reportedText = minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`;

  return (
    <Card style={!open && styles.cardClosed}>
      <View style={styles.cardTop}>
        <Text style={styles.terminalName}>{displayName(terminal.name)}</Text>
        <View style={styles.modeChip}>
          <Badge
            label={terminal.mode === 'jeepney' ? 'Jeepney' : 'Tricycle'}
            tone={terminal.mode === 'jeepney' ? 'route' : 'fare'}
          />
        </View>
      </View>
      <View style={styles.cardRow}>
        <Badge label={open ? 'Open' : 'Closed'} tone={open ? 'transit' : 'muted'} />
        <Text style={styles.hours}>
          {terminal.operatingHours
            ? open
              ? `Closes at ${formatClock(terminal.operatingHours.closesAt)}`
              : `Opens at ${formatClock(terminal.operatingHours.opensAt)}`
            : 'Hours not set'}
        </Text>
      </View>
      <View style={styles.waitRow}>
        <Text style={[styles.wait, isStale && styles.dimmed]}>
          {open ? `~${waitMinutes} min wait` : '—'}
        </Text>
        {isStale ? (
          <Text style={styles.noReport}>No recent report</Text>
        ) : (
          <CongestionPill congestion={congestionOfQueue(status?.queueLevel ?? 'none')} />
        )}
      </View>
      <Text style={styles.reported}>
        {`Reported ${reportedText} · ${reportsToday} reports today`}
      </Text>
      <Button
        label="Report wait time"
        onPress={() =>
          router.push({ pathname: '/report', params: { terminalId: terminal.id } })
        }
        variant="secondary"
      />
    </Card>
  );
}

type Pin = { terminal: Terminal; x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
type PlacedLabel = { id: string; text: string; x: number; y: number };

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function layoutPins(width: number): Pin[] {
  const lats = terminals.map((terminal) => terminal.lat);
  const lngs = terminals.map((terminal) => terminal.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);
  const scale = Math.min(
    (width - MAP_PAD * 2) / lngSpan,
    (MAP_HEIGHT - MAP_PAD * 2) / latSpan,
  );
  const offsetX = (width - lngSpan * scale) / 2;
  const offsetY = (MAP_HEIGHT - latSpan * scale) / 2;
  return terminals.map((terminal) => ({
    terminal,
    x: offsetX + (terminal.lng - minLng) * scale,
    y: offsetY + (maxLat - terminal.lat) * scale,
  }));
}

function placeLabels(pins: Pin[], width: number): PlacedLabel[] {
  const placed: Box[] = [];
  const pinBoxes: Box[] = pins.map((pin) => ({ x: pin.x - 9, y: pin.y - 9, w: 18, h: 18 }));
  return pins.map((pin) => {
    const text = shortName(pin.terminal.name);
    const w = text.length * LABEL_CHAR + 4;
    const candidates: Box[] = [
      { x: pin.x + 10, y: pin.y - LABEL_HEIGHT / 2, w, h: LABEL_HEIGHT },
      { x: pin.x - 10 - w, y: pin.y - LABEL_HEIGHT / 2, w, h: LABEL_HEIGHT },
      { x: pin.x - w / 2, y: pin.y - 26, w, h: LABEL_HEIGHT },
      { x: pin.x - w / 2, y: pin.y + 14, w, h: LABEL_HEIGHT },
    ];
    const fits = (box: Box) =>
      box.x >= 2 &&
      box.x + box.w <= width - 2 &&
      box.y >= 0 &&
      box.y + box.h <= MAP_HEIGHT &&
      !placed.some((other) => overlaps(box, other)) &&
      !pinBoxes.some((other) => overlaps(box, other));
    const chosen = candidates.find(fits) ?? candidates[0];
    placed.push(chosen);
    return { id: pin.terminal.id, text, x: chosen.x, y: chosen.y };
  });
}

function TerminalMap({
  now,
  selectedId,
  onSelect,
}: {
  now: Date;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [width, setWidth] = useState(0);
  const { getTerminalStatus } = useLive();
  const pins = useMemo(() => (width > 0 ? layoutPins(width) : []), [width]);
  const labels = useMemo(() => (width > 0 ? placeLabels(pins, width) : []), [pins, width]);

  return (
    <Card>
      <View
        style={styles.mapWrap}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={MAP_HEIGHT}>
            {labels.map((label) => (
              <SvgText
                key={label.id}
                x={label.x}
                y={label.y + 9}
                fontSize={10}
                fontWeight="500"
                fill={colors.ink}>
                {label.text}
              </SvgText>
            ))}
            {pins.map((pin) => {
              const open = isOpen(pin.terminal, now);
              const status = getTerminalStatus(pin.terminal.id);
              const color =
                !open || status?.isStale
                  ? colors.muted
                  : CONGESTION_META[
                      congestionOfQueue(status?.queueLevel ?? 'none')
                    ].color;
              const selected = pin.terminal.id === selectedId;
              return (
                <G key={pin.terminal.id}>
                  <Circle
                    cx={pin.x}
                    cy={pin.y}
                    r={22}
                    fill="transparent"
                    onPress={() => onSelect(pin.terminal.id)}
                  />
                  {selected ? (
                    <Circle cx={pin.x} cy={pin.y} r={12} fill={color} fillOpacity={0.25} />
                  ) : null}
                  <Circle
                    cx={pin.x}
                    cy={pin.y}
                    r={selected ? 8 : 7}
                    fill={color}
                    stroke={colors.surface}
                    strokeWidth={2}
                  />
                </G>
              );
            })}
          </Svg>
        ) : null}
      </View>
    </Card>
  );
}

export default function TerminalsScreen() {
  const [view, setView] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () =>
      terminals.filter((terminal) => {
        if (filter === 'open') return isOpen(terminal, now);
        if (filter === 'jeepney' || filter === 'tricycle') return terminal.mode === filter;
        return true;
      }),
    [filter, now],
  );

  const selected = terminals.find((terminal) => terminal.id === selectedId);

  return (
    <Screen contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Terminals" />

      <Segmented
        options={[
          { value: 'list', label: 'List' },
          { value: 'map', label: 'Map' },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'list' ? (
        <>
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

          <View style={styles.list}>
            {filtered.map((terminal) => (
              <TerminalCard key={terminal.id} terminal={terminal} open={isOpen(terminal, now)} />
            ))}
            {filtered.length === 0 ? (
              <Text style={styles.empty}>No terminals match this filter.</Text>
            ) : null}
          </View>
        </>
      ) : (
        <>
          <TerminalMap now={now} selectedId={selectedId} onSelect={setSelectedId} />
          {selected ? <TerminalCard terminal={selected} open={isOpen(selected, now)} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  segmentItem: {
    flex: 1,
    minHeight: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  segmentItemActive: {
    backgroundColor: colors.transit,
  },
  segmentText: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.medium,
  },
  segmentTextActive: {
    color: colors.onTransit,
    fontWeight: type.weight.semibold,
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
  list: {
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modeChip: {
    flexShrink: 0,
  },
  terminalName: {
    flex: 1,
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.bold,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hours: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wait: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.semibold,
  },
  congestion: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  dimmed: {
    opacity: 0.5,
  },
  noReport: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  congestionText: {
    color: colors.onTransit,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
  },
  reported: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  cardClosed: {
    opacity: 0.6,
  },
  mapWrap: {
    width: '100%',
  },
  empty: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
});
