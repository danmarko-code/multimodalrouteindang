import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ScreenHeader } from '@/components/screen-header';
import { computePujFare, TRICYCLE_FARES, type TricycleZone } from '@/data/fares';
import { colors, radii, spacing, touch, type } from '@/theme';

type TableTab = 'jeepney' | 'tricycle';

const ZONES: TricycleZone[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const KM_ROWS = Array.from({ length: 20 }, (_, index) => index + 1);

const formatAmount = (value: number) => `₱${value.toFixed(2)}`;

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

function JeepneyTable() {
  return (
    <Card style={styles.tableCard}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.colDistance]}>Distance</Text>
        <Text style={[styles.headerCell, styles.colAmount]}>Regular</Text>
        <Text style={[styles.headerCell, styles.colWide]}>Student / Senior / PWD</Text>
      </View>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {KM_ROWS.map((km, index) => (
          <View key={km} style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
            <Text style={[styles.cell, styles.colDistance]}>{`${km} km`}</Text>
            <Text style={[styles.cell, styles.colAmount]}>
              {formatAmount(computePujFare(km))}
            </Text>
            <Text style={[styles.cell, styles.colWide]}>
              {formatAmount(computePujFare(km, 'discounted'))}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
}

function TricycleTable({ zone }: { zone: TricycleZone }) {
  const rows = useMemo(
    () => TRICYCLE_FARES.filter((row) => row.zone === zone),
    [zone],
  );

  return (
    <Card style={styles.tableCard}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.colDestination]}>Destination</Text>
        <Text style={[styles.headerCell, styles.colPrice]}>Day</Text>
        <Text style={[styles.headerCell, styles.colPrice]}>Night</Text>
      </View>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {rows.map((row, index) => (
          <View
            key={`${row.zone}-${row.destination}`}
            style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
            <Text style={[styles.cell, styles.colDestination]}>{row.destination}</Text>
            <Text style={[styles.cell, styles.colPrice]}>
              {formatAmount(row.regular)}
            </Text>
            <Text style={[styles.cell, styles.colPrice]}>
              {formatAmount(row.night)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
}

function ZonePicker({
  zone,
  onChange,
}: {
  zone: TricycleZone;
  onChange: (next: TricycleZone) => void;
}) {
  return (
    <View style={styles.zoneWrap}>
      <Text style={styles.zoneLabel}>Origin zone</Text>
      <View style={styles.zoneRow}>
        {ZONES.map((option) => {
          const active = option === zone;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityLabel={`Zone ${option}`}
              accessibilityState={{ selected: active }}
              style={[styles.zoneChip, active && styles.zoneChipActive]}>
              <Text style={[styles.zoneText, active && styles.zoneTextActive]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function FaresScreen() {
  const [tab, setTab] = useState<TableTab>('jeepney');
  const [zone, setZone] = useState<TricycleZone>('A');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Fares" />

      <View style={styles.switchWrap}>
        <Segmented
          options={[
            { value: 'jeepney', label: 'Jeepney table' },
            { value: 'tricycle', label: 'Tricycle table' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'tricycle' ? <ZonePicker zone={zone} onChange={setZone} /> : null}

      {tab === 'jeepney' ? <JeepneyTable /> : <TricycleTable zone={zone} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  switchWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  zoneWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  zoneLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
  },
  zoneRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  zoneChip: {
    flex: 1,
    minHeight: touch.min,
    minWidth: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  zoneChipActive: {
    backgroundColor: colors.transit,
    borderColor: colors.transit,
  },
  zoneText: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.semibold,
  },
  zoneTextActive: {
    color: colors.onTransit,
  },
  tableCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface,
  },
  headerCell: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowAlt: {
    backgroundColor: colors.paper,
  },
  cell: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  colDistance: {
    flex: 0.8,
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
  },
  colWide: {
    flex: 1.7,
    textAlign: 'right',
  },
  colDestination: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  colPrice: {
    flex: 0.6,
    textAlign: 'right',
  },
});
