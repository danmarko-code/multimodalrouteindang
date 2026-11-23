import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ScreenHeader } from '@/components/screen-header';
import { getPeriod } from '@/data/fares';
import { colors, radii, spacing, touch, type } from '@/theme';

const ORIGINS = ['Dasmariñas', 'Trece Martires', 'Current location'] as const;
const DESTINATIONS = ['CvSU Main Gate', 'CvSU Gate 2'] as const;
const CHIP_MINUTES = 5;

function roundUpToFive(date: Date): Date {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  const remainder = rounded.getMinutes() % CHIP_MINUTES;
  if (remainder !== 0) rounded.setMinutes(rounded.getMinutes() + CHIP_MINUTES - remainder);
  return rounded;
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function timeToday(hours: number, minutes: number): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const TIME_CHIPS: { label: string; apply: (current: Date) => Date }[] = [
  { label: '+30 min', apply: (current) => new Date(current.getTime() + 30 * 60 * 1000) },
  { label: '+1 hr', apply: (current) => new Date(current.getTime() + 60 * 60 * 1000) },
  { label: '6:00 AM', apply: () => timeToday(6, 0) },
  { label: '9:00 PM', apply: () => timeToday(21, 0) },
];

export default function SearchScreen() {
  const [origin, setOrigin] = useState<string>('Dasmariñas');
  const [destination, setDestination] = useState<string>('CvSU Main Gate');
  const [departure, setDeparture] = useState<'now' | 'at'>('now');
  const [departTime, setDepartTime] = useState(() => roundUpToFive(new Date()));
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = () => setPickerOpen(true);

  const onPickTime = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setPickerOpen(false);
    if (event.type === 'set' && date) setDepartTime(date);
  };

  const applyChip = (chip: (typeof TIME_CHIPS)[number]) => {
    setDepartTime((current) => chip.apply(current));
  };

  const openFrom = () => {
    setFromOpen(true);
    setToOpen(false);
  };

  const openTo = () => {
    setToOpen(true);
    setFromOpen(false);
  };

  const toggleFrom = () => {
    if (fromOpen) {
      setFromOpen(false);
    } else {
      openFrom();
    }
  };

  const toggleTo = () => {
    if (toOpen) {
      setToOpen(false);
    } else {
      openTo();
    }
  };

  const selectOrigin = (place: string) => {
    setOrigin(place);
    setFromOpen(false);
  };

  const selectDestination = (place: string) => {
    setDestination(place);
    setToOpen(false);
  };

  const findRoutes = () => {
    const departureDate = departure === 'now' ? new Date() : departTime;
    const originParam = origin.toLowerCase().includes('dasmarinas') ? 'dasmarinas' : 'trece';
    router.push({
      pathname: '/results',
      params: {
        origin: originParam,
        destination: destination.toLowerCase().includes('gate 2') ? 'cvsu-gate-2' : 'cvsu-gate',
        departureAt: String(departureDate.getTime()),
        period: getPeriod(departureDate),
      },
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Search" />

      <Card style={styles.card}>
        <Text style={styles.label}>From</Text>
        <View style={styles.selectContainer}>
          <Pressable
            onPress={toggleFrom}
            accessibilityRole="button"
            accessibilityState={{ expanded: fromOpen }}
            accessibilityLabel={`Origin, ${origin}. Change origin`}
            style={({ pressed }) => [styles.input, styles.selectField, pressed && styles.pressed]}>
            <Text style={styles.selectValue}>{origin}</Text>
            <Text style={styles.selectGlyph}>{fromOpen ? '▸' : '▾'}</Text>
          </Pressable>
          {fromOpen && (
            <View style={styles.menu}>
              {ORIGINS.map((place) => {
                const active = origin === place;
                return (
                  <Pressable
                    key={place}
                    onPress={() => selectOrigin(place)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.menuItem, active && styles.menuItemSelected]}>
                    <View style={styles.menuItemRow}>
                      <Text style={[styles.menuText, active && styles.menuTextSelected]}>{place}</Text>
                      {active && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                    {place === 'Current location' && !active && (
                      <Text style={styles.locationIcon}>◎</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Text style={[styles.label, styles.labelSpaced]}>To</Text>
        <View style={styles.selectContainer}>
          <Pressable
            onPress={toggleTo}
            accessibilityRole="button"
            accessibilityState={{ expanded: toOpen }}
            accessibilityLabel={`Destination, ${destination}. Change destination`}
            style={({ pressed }) => [styles.input, styles.selectField, pressed && styles.pressed]}>
            <Text style={styles.selectValue}>{destination}</Text>
            <Text style={styles.selectGlyph}>{toOpen ? '▸' : '▾'}</Text>
          </Pressable>
          {toOpen && (
            <View style={styles.menu}>
              {DESTINATIONS.map((place) => {
                const active = destination === place;
                return (
                  <Pressable
                    key={place}
                    onPress={() => selectDestination(place)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.menuItem, active && styles.menuItemSelected]}>
                    <View style={styles.menuItemRow}>
                      <Text style={[styles.menuText, active && styles.menuTextSelected]}>{place}</Text>
                      {active && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Departure</Text>
        <View style={styles.segment}>
          {(['now', 'at'] as const).map((option) => {
            const active = departure === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setDeparture(option);
                  if (option === 'now') setPickerOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.segmentItem, active && styles.segmentItemActive]}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option === 'now' ? 'Leave now' : 'Depart at'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {departure === 'at' ? (
          <>
            <Pressable
              onPress={openPicker}
              accessibilityRole="button"
              accessibilityLabel={`Departure time, ${formatTime(departTime)}. Change time`}
              style={({ pressed }) => [
                styles.input,
                styles.timeField,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.timeValue}>{formatTime(departTime)}</Text>
              <Text style={styles.timeGlyph}>▾</Text>
            </Pressable>

            {pickerOpen ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={departTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  is24Hour={false}
                  onChange={onPickTime}
                />
                {Platform.OS === 'ios' ? (
                  <Pressable
                    onPress={() => setPickerOpen(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm departure time"
                    style={({ pressed }) => [styles.pickerDone, pressed && styles.pressed]}>
                    <Text style={styles.pickerDoneText}>Done</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <View style={styles.timeChips}>
              {TIME_CHIPS.map((chip) => (
                <Pressable
                  key={chip.label}
                  onPress={() => applyChip(chip)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set departure time to ${chip.label}`}
                  style={({ pressed }) => [styles.timeChip, pressed && styles.pressed]}>
                  <Text style={styles.timeChipText}>{chip.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.period}>
          {getPeriod(departure === 'now' ? new Date() : departTime) === 'day'
            ? 'Day fare applies'
            : 'Night fare applies (9:00 PM to 4:00 AM)'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Find routes" onPress={findRoutes} />
      </View>
    </ScrollView>
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
  card: {
    marginHorizontal: spacing.lg,
  },
  label: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
    marginBottom: spacing.xs,
  },
  labelSpaced: {
    marginTop: spacing.md,
  },
  input: {
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontSize: type.size.md,
  },
  timeField: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeValue: {
    color: colors.ink,
    fontSize: type.size.md,
  },
  timeGlyph: {
    color: colors.muted,
    fontSize: type.size.md,
  },
  pickerWrap: {
    marginTop: spacing.sm,
  },
  pickerDone: {
    alignSelf: 'flex-end',
    minHeight: touch.min,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pickerDoneText: {
    color: colors.transit,
    fontSize: type.size.sm,
    fontWeight: type.weight.semibold,
  },
  timeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeChip: {
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  timeChipText: {
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
    fontWeight: type.weight.medium,
  },
  period: {
    marginTop: spacing.md,
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
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
    fontWeight: type.weight.medium,
  },
  segmentTextActive: {
    color: colors.onTransit,
    fontWeight: type.weight.semibold,
  },
  actions: {
    marginHorizontal: spacing.lg,
  },
  selectContainer: {},
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touch.min,
  },
  selectValue: {
    color: colors.ink,
    fontSize: type.size.md,
    flex: 1,
  },
  selectGlyph: {
    color: colors.muted,
    fontSize: type.size.md,
  },
  menu: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  menuText: {
    color: colors.ink,
    fontSize: type.size.md,
    flex: 1,
  },
  menuTextSelected: {
    color: '#15803d',
    fontWeight: type.weight.semibold,
  },
  checkIcon: {
    color: '#15803d',
    fontSize: type.size.md,
    fontWeight: 'bold',
  },
  locationIcon: {
    color: colors.transit,
    fontSize: type.size.md,
    marginLeft: spacing.sm,
  },
});