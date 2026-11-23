import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Card } from '@/components/card';
import { ScreenHeader } from '@/components/screen-header';
import { terminals } from '@/data/indang';
import {
  ALL_TERMINALS,
  getTrends,
  TREND_HOURS,
  TREND_WEEKDAYS,
  type TerminalTrends,
} from '@/data/trends';
import { colors, radii, spacing, touch, type } from '@/theme';

type Period = 'week' | 'month';

const CHART_HEIGHT = 200;
const CHART_TOP = 16;
const CHART_BOTTOM = 26;
const CHART_LEFT = 46;
const CHART_RIGHT = 8;

const TERMINAL_OPTIONS = [
  { id: ALL_TERMINALS, name: 'All terminals' },
  ...terminals.map((terminal) => ({ id: terminal.id, name: terminal.name })),
];

function formatHour(hour: number, withMinutes = false): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return withMinutes ? `${hour12}:00 ${period}` : `${hour12} ${period}`;
}

function busiestIndex(values: number[]): number {
  return values.indexOf(Math.max(...values));
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

function SummaryRow({
  trends,
  period,
}: {
  trends: TerminalTrends;
  period: Period;
}) {
  const peakHour = TREND_HOURS[busiestIndex(trends.hourlyAverageWait)];
  const averageWait = Math.round(
    trends.hourlyAverageWait.reduce((sum, value) => sum + value, 0) /
      trends.hourlyAverageWait.length,
  );
  const reports =
    period === 'week'
      ? trends.reportsPerDay.reduce((sum, value) => sum + value, 0)
      : trends.reportsLast30Days;

  return (
    <View style={styles.summaryRow}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Busiest hour</Text>
        <Text style={styles.summaryValue}>{formatHour(peakHour, true)}</Text>
      </Card>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Average wait</Text>
        <Text style={styles.summaryValue}>{`${averageWait} min`}</Text>
      </Card>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Reports</Text>
        <Text style={styles.summaryValue}>{String(reports)}</Text>
      </Card>
    </View>
  );
}

function BusiestHoursChart({ trends }: { trends: TerminalTrends }) {
  const [width, setWidth] = useState(0);
  const values = trends.hourlyAverageWait;
  const max = Math.max(...values);
  const yMax = Math.max(10, Math.ceil(max / 10) * 10);
  const peakIndex = busiestIndex(values);
  const plotWidth = Math.max(0, width - CHART_LEFT - CHART_RIGHT);
  const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
  const slot = plotWidth / values.length;
  const barWidth = Math.max(4, slot * 0.6);
  const y = (value: number) => CHART_TOP + plotHeight - (value / yMax) * plotHeight;
  const grid = [0, yMax / 2, yMax];

  return (
    <Card style={styles.chartCard}>
      <Text style={styles.chartTitle}>Busiest hours</Text>
      <View
        style={styles.chartWrap}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            {grid.map((value) => (
              <G key={value}>
                <Line
                  x1={CHART_LEFT}
                  y1={y(value)}
                  x2={width - CHART_RIGHT}
                  y2={y(value)}
                  stroke={colors.line}
                  strokeWidth={1}
                />
                <SvgText
                  x={CHART_LEFT - 6}
                  y={y(value) + 3}
                  fontSize={9}
                  fill={colors.muted}
                  textAnchor="end">
                  {`${Math.round(value)} min`}
                </SvgText>
              </G>
            ))}
            {values.map((value, index) => (
              <Rect
                key={`bar-${index}`}
                x={CHART_LEFT + index * slot + (slot - barWidth) / 2}
                y={y(value)}
                width={barWidth}
                height={Math.max(1, y(0) - y(value))}
                rx={2}
                fill={index === peakIndex ? colors.fare : colors.transit}
              />
            ))}
            {values.map((value, index) =>
              index % 3 === 0 ? (
                <SvgText
                  key={`label-${index}`}
                  x={CHART_LEFT + index * slot + slot / 2}
                  y={CHART_HEIGHT - 8}
                  fontSize={10}
                  fill={colors.muted}
                  textAnchor="middle">
                  {formatHour(TREND_HOURS[index])}
                </SvgText>
              ) : null,
            )}
          </Svg>
        ) : null}
      </View>
      <Text style={styles.takeaway}>
        {`Waits peak at ${formatHour(TREND_HOURS[peakIndex], true)}`}
      </Text>
    </Card>
  );
}

function WeekdayChart({ trends }: { trends: TerminalTrends }) {
  const [width, setWidth] = useState(0);
  const values = trends.weekdayAverageWait;
  const max = Math.max(...values);
  const yMax = Math.max(5, Math.ceil(max / 5) * 5);
  const peakIndex = busiestIndex(values);
  const top = 28;
  const bottom = 26;
  const left = 8;
  const right = 8;
  const plotWidth = Math.max(0, width - left - right);
  const plotHeight = CHART_HEIGHT - top - bottom;
  const step = plotWidth / (values.length - 1);
  const x = (index: number) => left + index * step;
  const y = (value: number) => top + plotHeight - (value / yMax) * plotHeight;
  const baseline = top + plotHeight;
  const linePath = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)},${y(value)}`)
    .join(' ');
  const areaPath = `M ${x(0)},${baseline} ${values
    .map((value, index) => `L ${x(index)},${y(value)}`)
    .join(' ')} L ${x(values.length - 1)},${baseline} Z`;

  return (
    <Card style={styles.chartCard}>
      <Text style={styles.chartTitle}>Average wait by weekday</Text>
      <View
        style={styles.chartWrap}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Line
              x1={left}
              y1={baseline}
              x2={width - right}
              y2={baseline}
              stroke={colors.line}
              strokeWidth={1}
            />
            <Path d={areaPath} fill={colors.transit} fillOpacity={0.12} />
            <Path
              d={linePath}
              fill="none"
              stroke={colors.transit}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {values.map((value, index) => (
              <Circle
                key={`point-${index}`}
                cx={x(index)}
                cy={y(value)}
                r={3.5}
                fill={colors.transit}
                stroke={colors.surface}
                strokeWidth={2}
              />
            ))}
            <SvgText
              x={x(peakIndex)}
              y={y(max) - 8}
              fontSize={10}
              fontWeight="600"
              fill={colors.ink}
              textAnchor="middle">
              {`${max} min`}
            </SvgText>
            {values.map((value, index) => (
              <SvgText
                key={`day-${index}`}
                x={x(index)}
                y={CHART_HEIGHT - 8}
                fontSize={9}
                fill={colors.muted}
                textAnchor="middle">
                {TREND_WEEKDAYS[index].slice(0, 3)}
              </SvgText>
            ))}
          </Svg>
        ) : null}
      </View>
      <Text style={styles.takeaway}>
        {`Longest waits on ${TREND_WEEKDAYS[peakIndex]}`}
      </Text>
    </Card>
  );
}

export default function TrendsScreen() {
  const [terminalId, setTerminalId] = useState<string>(ALL_TERMINALS);
  const [period, setPeriod] = useState<Period>('week');
  const [dropdown, setDropdown] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<any>(null);

  const trends = getTrends(terminalId);
  const selectedName =
    TERMINAL_OPTIONS.find((option) => option.id === terminalId)?.name ??
    'All terminals';

  const openDropdown = () => {
    triggerRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setDropdown({ top: y + height + 4, left: x, width });
      },
    );
  };

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="Trends" />

        <Card style={styles.controlsCard}>
          <Text style={styles.label}>Terminal</Text>
          <Pressable
            ref={triggerRef}
            onPress={openDropdown}
            accessibilityRole="button"
            accessibilityState={{ expanded: dropdown !== null }}
            accessibilityLabel={`Terminal, ${selectedName}. Change terminal`}
            style={({ pressed }) => [styles.selectField, pressed && styles.pressed]}>
            <Text style={styles.selectValue} numberOfLines={1}>
              {selectedName}
            </Text>
            <Text style={styles.selectGlyph}>{dropdown ? '▴' : '▾'}</Text>
          </Pressable>

          <View style={styles.periodSwitch}>
            <Segmented
              options={[
                { value: 'week', label: 'Last 7 days' },
                { value: 'month', label: 'Last 30 days' },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </View>
        </Card>

        <SummaryRow trends={trends} period={period} />
        <BusiestHoursChart trends={trends} />
        <WeekdayChart trends={trends} />
      </ScrollView>

      {dropdown ? (
        <Modal
          visible
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setDropdown(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDropdown(null)} />
          <View
            style={[
              styles.modalList,
              { top: dropdown.top, left: dropdown.left, width: dropdown.width },
            ]}>
            {TERMINAL_OPTIONS.map((option) => {
              const active = option.id === terminalId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setTerminalId(option.id);
                    setDropdown(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.modalItem, active && styles.modalItemSelected]}>
                  <View style={styles.modalItemRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.modalItemText, active && styles.modalItemTextSelected]}>
                      {option.name}
                    </Text>
                    {active ? <Text style={styles.checkIcon}>✓</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  controlsCard: {
    marginHorizontal: spacing.lg,
  },
  label: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
    marginBottom: spacing.xs,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
  },
  selectValue: {
    flex: 1,
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
  },
  selectGlyph: {
    color: colors.muted,
    fontSize: type.size.md,
  },
  pressed: {
    opacity: 0.7,
  },
  periodSwitch: {
    marginTop: spacing.md,
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  summaryValue: {
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.semibold,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chartTitle: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.bold,
  },
  chartWrap: {
    width: '100%',
  },
  takeaway: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  modalList: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  modalItem: {
    height: touch.min,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  modalItemText: {
    color: colors.ink,
    fontSize: type.size.md,
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#15803d',
    fontWeight: type.weight.semibold,
  },
  checkIcon: {
    color: '#15803d',
    fontSize: type.size.md,
    fontWeight: 'bold',
  },
});
