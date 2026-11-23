import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { ScreenHeader } from '@/components/screen-header';
import {
  getRouteAvailability,
  places,
  RESULTS_ORIGINS,
  resultsRoutesByOrigin,
  type ResultsOrigin,
  type ResultsLeg,
  type ResultsRoute,
  type RouteAvailability,
} from '@/data/indang';
import {
  computeFare,
  getPeriod,
  type FareLeg,
  type FarePeriod,
  type PassengerType,
} from '@/data/fares';
import { colors, radii, spacing, touch, type } from '@/theme';

type Mode = FareLeg['mode'];
type BadgeKind = 'cheapest' | 'fastest' | 'operating';

const TRIP = {
  origin: places.find((place) => place.id === 'p-cvsu-gate')?.name ?? 'CvSU Main Gate',
  destination: 'Tagaytay',
};

const PASSENGER_OPTIONS: { value: PassengerType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'discounted', label: 'Student, Senior, PWD' },
];

const BADGE_TONE: Record<BadgeKind, 'fare' | 'route' | 'transit'> = {
  cheapest: 'fare',
  fastest: 'route',
  operating: 'transit',
};

const BADGE_LABEL: Record<BadgeKind, string> = {
  cheapest: 'Cheapest',
  fastest: 'Fastest',
  operating: 'Operating now',
};

const MODE_META: Record<Mode, { label: string; color: string }> = {
  walk: { label: 'Walk', color: colors.muted },
  tricycle: { label: 'Tricycle', color: colors.fare },
  jeepney: { label: 'Jeepney', color: colors.route },
};

const totalTime = (legs: ResultsLeg[]) =>
  legs.reduce((sum, leg) => sum + leg.durationMin, 0);

const totalFare = (legs: ResultsLeg[], passenger: PassengerType, period: FarePeriod) =>
  legs.reduce((sum, leg) => sum + computeFare(leg, { passenger, period }), 0);

const transferCount = (legs: ResultsLeg[]) =>
  Math.max(0, legs.filter((leg) => leg.mode !== 'walk').length - 1);

const formatFare = (value: number) =>
  Number.isInteger(value) ? `₱${value}` : `₱${value.toFixed(2)}`;

const formatTransfer = (count: number) =>
  count === 0 ? 'Direct' : `${count} transfer${count > 1 ? 's' : ''}`;

const formatTime = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;

type Availability = RouteAvailability;

// Badges fall out of the totals of the routes that are actually available.
function computeBadges(
  routes: ResultsRoute[],
  availability: Record<string, Availability>,
  passenger: PassengerType,
  period: FarePeriod,
): Record<string, BadgeKind[]> {
  const available = routes.filter((route) => availability[route.id]?.available);
  const badges: Record<string, BadgeKind[]> = {};
  if (available.length === 0) return badges;

  const cheapest = Math.min(
    ...available.map((route) => totalFare(route.legs, passenger, period)),
  );
  const fastest = Math.min(...available.map((route) => totalTime(route.legs)));

  for (const route of available) {
    const kinds: BadgeKind[] = [];
    if (totalFare(route.legs, passenger, period) === cheapest) kinds.push('cheapest');
    if (totalTime(route.legs) === fastest) kinds.push('fastest');
    kinds.push('operating');
    badges[route.id] = kinds;
  }
  return badges;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const [passenger, setPassenger] = useState<PassengerType>('regular');
  const params = useLocalSearchParams<{
    origin?: string;
    destination?: string;
    departureAt?: string;
    period?: string;
  }>();

  const originFromParam = params.origin as ResultsOrigin | undefined;
  const origin = originFromParam ? originFromParam : 'dasmarinas';
  const destinationFromParam = params.destination as string | undefined;
  const destination = destinationFromParam ? String(destinationFromParam) : 'cvsu-gate';
  const departureAt = Number(params.departureAt);
  const departure = Number.isFinite(departureAt) && departureAt > 0 ? new Date(departureAt) : new Date();
  const period: FarePeriod =
    params.period === 'day' || params.period === 'night' ? params.period : getPeriod(departure);

  const availableRoutes = resultsRoutesByOrigin[origin ?? 'dasmarinas'];
  const availability: Record<string, Availability> = Object.fromEntries(
    availableRoutes.map((route) => [route.id, getRouteAvailability(route, departure)]),
  );
  const badges = computeBadges(availableRoutes, availability, passenger, period);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back to search"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backText}>‹ Search</Text>
        </Pressable>

        <ScreenHeader title="Routes" subtitle={`${RESULTS_ORIGINS[origin] ?? 'Dasmariñas'} → ${destination === 'cvsu-gate-2' ? 'CvSU Gate 2' : 'CvSU Main Gate'}`} />

        <View style={styles.toggleWrap}>
          <Text style={styles.toggleLabel}>Passenger</Text>
          <View style={styles.segment}>
            {PASSENGER_OPTIONS.map((option) => {
              const active = passenger === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPassenger(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}>
                  <Text
                    numberOfLines={2}
                    style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {period === 'night' ? (
            <Text style={styles.nightNote}>Night fare applies (9:00 PM to 4:00 AM)</Text>
          ) : null}
        </View>

        {availableRoutes.map((route) => {
          const status = availability[route.id] ?? { available: true };
          const unavailable = !status.available;
          const fare = totalFare(route.legs, passenger, period);
          const goToDetail = () => {
            router.push({
              pathname: '/route-detail',
              params: {
                id: route.id,
                origin,
                destination,
                departureAt: String(departure.getTime()),
                period,
                passenger,
              },
            });
          };
          return (
            <Pressable
              key={route.id}
              onPress={unavailable ? undefined : goToDetail}
              accessibilityRole="button"
              accessibilityLabel={unavailable ? undefined : `View ${route.name}`}
              accessibilityState={{ disabled: unavailable }}
              style={({ pressed }) => [pressed && styles.pressed]}>
              <Card style={[styles.card, unavailable && styles.cardUnavailable]}>
              <View style={styles.cardHeader}>
                <Text style={styles.routeName}>{route.name}</Text>
                <View style={styles.badges}>
                  {unavailable ? (
                    <Badge tone="muted" label="Unavailable" />
                  ) : (
                    (badges[route.id] ?? []).map((badge) => (
                      <Badge key={badge} tone={BADGE_TONE[badge]} label={BADGE_LABEL[badge]} />
                    ))
                  )}
                </View>
              </View>

              <View style={styles.metrics}>
                <Metric label="Time" value={formatTime(totalTime(route.legs))} />
                <Metric label="Total fare" value={unavailable ? '—' : formatFare(fare)} />
                <Metric label="Transfers" value={formatTransfer(transferCount(route.legs))} />
              </View>

              <View style={styles.modeStrip}>
                {route.legs.map((leg, index) => {
                  const meta = MODE_META[leg.mode];
                  const legFare = computeFare(leg, { passenger, period });
                  return (
                    <View key={`${route.id}-${index}`} style={styles.mode}>
                      <View style={[styles.modeDot, { backgroundColor: meta.color }]} />
                      <Text style={styles.modeText}>
                        {meta.label} {leg.durationMin}m · {leg.mode === 'walk' ? 'Free' : formatFare(legFare)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {status.reason ? <Text style={styles.reason}>{status.reason}</Text> : null}
            </Card>
          </Pressable>
        );
        })}
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
  toggleWrap: {
    marginHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  toggleLabel: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
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
    paddingHorizontal: spacing.xs,
  },
  segmentItemActive: {
    backgroundColor: colors.transit,
  },
  segmentText: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.medium,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.onTransit,
    fontWeight: type.weight.semibold,
  },
  nightNote: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  card: {
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cardUnavailable: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  routeName: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.bold,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.md,
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
  modeStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeText: {
    color: colors.ink,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  reason: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
});
