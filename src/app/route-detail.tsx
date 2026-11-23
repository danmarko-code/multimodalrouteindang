import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ScreenHeader } from '@/components/screen-header';
import { resultsRoutesByOrigin, terminals } from '@/data/indang';
import { computeFare, getPeriod, type FareLeg, type FarePeriod, type PassengerType } from '@/data/fares';
import { colors, spacing, type } from '@/theme';

type Params = {
  id?: string;
  origin?: string;
  destination?: string;
  departureAt?: string;
  period?: string;
  passenger?: string;
};

type Mode = 'walk' | 'tricycle' | 'jeepney';

const MODE_META: Record<Mode, { label: string; color: string }> = {
  walk: { label: 'Walk', color: colors.muted },
  tricycle: { label: 'Tricycle', color: colors.fare },
  jeepney: { label: 'Jeepney', color: colors.route },
};

const FARE_NOTE =
  'Fares follow LTFRB and Indang Ordinance No. 267-S-2023. Actual charges may vary.';

const FORMAT_TIME = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)} h ${minutes % 60} min`
    : `${minutes} min`;

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function terminalName(id: string | undefined): string {
  return id ? terminals.find((t) => t.id === id)?.name ?? '' : '';
}

export default function RouteDetailScreen() {
  const params = useLocalSearchParams<Params>();

  const origin = (params.origin as 'dasmarinas' | 'trece' | undefined) ?? 'dasmarinas';
  const destination = params.destination ?? '';
  const passenger: PassengerType =
    params.passenger === 'discounted' ? 'discounted' : 'regular';

  const route = useMemo(() => {
    const routes = resultsRoutesByOrigin[origin];
    return routes?.find((route) => route.id === params.id);
  }, [origin, params.id]);

  const departure = useMemo(() => {
    const at = Number(params.departureAt);
    return Number.isFinite(at) && at > 0 ? new Date(at) : new Date();
  }, [params.departureAt]);

  const period: FarePeriod =
    params.period === 'day' || params.period === 'night'
      ? params.period
      : getPeriod(departure);

  const totalTime = (legs: readonly FareLeg[]) =>
    legs.reduce((sum, leg) => sum + ((leg as any).durationMin ?? 0), 0);

  const totalFare = (legs: readonly FareLeg[]) =>
    legs.reduce((sum, leg) => sum + computeFare(leg, { passenger, period }), 0);

  const transferCount = (legs: readonly FareLeg[]) =>
    Math.max(0, legs.filter((leg) => leg.mode !== 'walk').length - 1);

  const formatFare = (value: number) =>
    Number.isInteger(value) ? `₱${value}` : `₱${value.toFixed(2)}`;

  const formatTransfer = (count: number) =>
    count === 0 ? 'Direct' : `${count} transfer${count > 1 ? 's' : ''}`;

  const journey = useMemo(() => {
    if (!route) return null;
    const legs = route.legs;
    if (legs.length === 0) return null;
    return legs.map((leg, i) => {
      const prev = legs[i - 1];
      const next = legs[i + 1];
      const boarding =
        leg.fromTerminalId !== undefined
          ? terminalName(leg.fromTerminalId)
          : i === 0
            ? origin
            : prev?.toTerminalId !== undefined
              ? terminalName(prev.toTerminalId) ?? ''
              : destination;
      const dropOff =
        leg.toTerminalId !== undefined
          ? terminalName(leg.toTerminalId) ?? ''
          : i === legs.length - 1
            ? destination
            : next?.fromTerminalId !== undefined
              ? terminalName(next.fromTerminalId) ?? ''
              : destination;
      return { leg, boarding, dropOff };
    });
  }, [route, origin, destination]);

  const totalTimeValue = useMemo(() => totalTime(route?.legs ?? []), [route]);
  const totalFareValue = useMemo(() => totalFare(route?.legs ?? []), [route]);

  const travelModes = useMemo(() => {
    if (!route) return [];
    return route.legs.map((leg) => leg.mode);
  }, [route]);

  const hasWalking = useMemo(() => travelModes.includes('walk'), [travelModes]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title={`${origin === 'dasmarinas' ? 'Dasmariñas' : 'Trece Martires'} → ${route?.name ?? ''}`}
          subtitle=""
        />

        {/* --- Summary row --- */}
        <View style={styles.summary}>
          <Metric
            label="Total time"
            value={route ? FORMAT_TIME(totalTimeValue) : '—'}
          />
          <Metric
            label="Total fare"
            value={route ? formatFare(totalFareValue) : '—'}
          />
          <Metric label="Transfers" value={route ? formatTransfer(transferCount(route.legs)) : '—'} />
        </View>

        {/* --- Period note --- */}
        {route && (
          <Text style={[styles.periodNote, period === 'night' && styles.nightNote]}>
            {period === 'night'
              ? 'Night fare applies (9:00 PM to 4:00 AM)'
              : 'Day fare applies'}
          </Text>
        )}

        {/* --- Empty card for future route diagram --- */}
        <View style={styles.diagramPlaceholder} />

        {/* --- Timeline --- */}
        <View style={styles.timeline}>
          {journey?.map(({ leg, boarding, dropOff }, i) => {
            const mode = leg.mode as Mode;
            const modeMeta = MODE_META[mode];
            const legFare = computeFare(leg, { passenger, period });
            const legFareText = hasWalking && mode === 'walk' ? 'Free' : formatFare(legFare);
            const modeLabel = modeMeta.label;
            const durationText = FORMAT_TIME((leg as any).durationMin);

            // For tricycle, show zone and destination on the drop-off line
            const tricycleNote =
              mode === 'tricycle' && dropOff
                ? <Text style={styles.tricycleNote}>{dropOff}</Text>
                : null;

            return (
              <View
                key={i}
                style={[
                  styles.timelineRow,
                  { borderColor: modeMeta.color },
                  mode === 'walk' && styles.walkRow,
                ]}>
                <View style={styles.dotContainer}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: modeMeta.color },
                    ]} />
                </View>
                <View style={styles.legContent}>
                  <View style={styles.modeAndDuration}>
                    <Text style={styles.modeLabel}>{modeLabel} {durationText}</Text>
                  </View>
                  <Text style={styles.boarding}>{boarding}</Text>
                  {tricycleNote}
                  <Text style={styles.dropOff}>{dropOff}</Text>
                </View>
                {mode !== 'walk' && (
                  <Text style={styles.fare}>{legFareText}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* --- Fare breakdown card --- */}
        {route && (
          <Card style={styles.fareCard}>
            <View style={styles.fareCardHeader}>
              <Text style={styles.fareCardLabel}>Fare breakdown</Text>
            </View>
            <View style={styles.fareCardBody}>
              {route.legs
                .filter((leg) => leg.mode !== 'walk')
                .map((leg, i) => {
                  const mode = leg.mode as Mode;
                  const modeMeta = MODE_META[mode];
                  const legFare = computeFare(leg, { passenger, period });
                  return (
                    <View key={i} style={styles.fareRow}>
                      <Text style={styles.fareModeLabel}>
                        {modeMeta.label} {FORMAT_TIME((leg as any).durationMin)}
                      </Text>
                      <Text style={styles.fareValue}>{formatFare(legFare)}</Text>
                    </View>
                  );
                })}
              <View style={styles.fareTotalRow}>
                <Text style={styles.fareTotalLabel}>Total</Text>
                <Text style={styles.fareTotalValue}>
                  {formatFare(totalFareValue)}
                </Text>
              </View>
            </View>
            <Text style={styles.fareNote}>{FARE_NOTE}</Text>
          </Card>
        )}

        {/* --- Report button --- */}
        <Button
          label="Report terminal wait time"
          onPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  metricValue: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.semibold,
  },
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  periodNote: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  nightNote: {
    color: colors.muted,
  },
  diagramPlaceholder: {
    height: 220,
    width: '100%',
    backgroundColor: colors.line,
  },
  timeline: {
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  dotContainer: {
    width: 8,
    flex: 0,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walkRow: {
    alignSelf: 'center',
  },
  legContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modeAndDuration: {
    flexDirection: 'column',
  },
  modeLabel: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.medium,
  },
  boarding: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    flex: 1,
  },
  dropOff: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  tricycleNote: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    marginLeft: spacing.sm,
  },
  fare: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    flex: 0,
  },
  fareCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  fareCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  fareCardLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
  },
  fareCardBody: {
    paddingTop: spacing.xs,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  fareModeLabel: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    flex: 1,
  },
  fareValue: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    textAlign: 'right',
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    fontWeight: type.weight.semibold,
  },
  fareTotalLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  fareTotalValue: {
    color: colors.transit,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  fareNote: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    marginTop: spacing.xs,
    marginHorizontal: spacing.lg,
  },
});