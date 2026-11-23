import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ScreenHeader } from '@/components/screen-header';
import { PUJ_CONFIG, TRICYCLE_CONFIG, type PassengerType } from '@/data/fares';
import { colors, radii, spacing, touch, type } from '@/theme';

type Language = 'English' | 'Filipino';

const LANGUAGES: Language[] = ['English', 'Filipino'];

const PASSENGER_OPTIONS: { value: PassengerType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'discounted', label: 'Student, Senior, PWD' },
];

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export default function MoreScreen() {
  const [language, setLanguage] = useState<Language>('English');
  const [passenger, setPassenger] = useState<PassengerType>('regular');
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [checking, setChecking] = useState(false);
  const [upToDate, setUpToDate] = useState(false);
  const [dropdown, setDropdown] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const languageRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const openLanguage = () => {
    const el = languageRef.current;
    if (el) {
      el.measureInWindow((x: number, y: number, width: number, height: number) => {
        setDropdown({ top: y + height + 4, left: x, width });
      });
    }
  };

  const checkForUpdates = () => {
    if (checking || upToDate) return;
    setChecking(true);
    timerRef.current = setTimeout(() => {
      setChecking(false);
      setUpToDate(true);
    }, 1500);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScreenHeader title="More" />

          <Card style={styles.group}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={[styles.row, styles.rowBetween]}>
              <Text style={styles.rowLabel}>Language</Text>
              <Pressable
                ref={languageRef}
                onPress={openLanguage}
                accessibilityRole="button"
                accessibilityState={{ expanded: dropdown !== null }}
                accessibilityLabel={`Language, ${language}. Change language`}
                style={({ pressed }) => [styles.selectField, pressed && styles.pressed]}>
                <Text style={styles.selectValue}>{language}</Text>
                <Text style={styles.selectGlyph}>{dropdown ? '▴' : '▾'}</Text>
              </Pressable>
            </View>

            <View style={[styles.row, styles.rowStack]}>
              <Text style={styles.rowLabel}>Default passenger type</Text>
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
            </View>
          </Card>

          <Card style={styles.group}>
            <Text style={styles.sectionTitle}>Offline data</Text>

            <View style={styles.offlineStatus}>
              <Text style={styles.offlineCheck}>✓</Text>
              <Text style={styles.offlineStatusText}>Offline ready</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowText}>Offline data v2.4</Text>
              <Text style={styles.rowMuted}>Updated 2 days ago</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.updateButton}>
                <Button
                  label={upToDate ? 'Up to date' : checking ? 'Checking…' : 'Check for updates'}
                  onPress={checkForUpdates}
                  variant="secondary"
                  disabled={checking || upToDate}
                />
              </View>
              {checking ? <ActivityIndicator color={colors.transit} /> : null}
            </View>

            <View style={styles.row}>
              <Text style={styles.rowMuted}>
                Routes, footpaths, terminals, fares and operating hours
              </Text>
            </View>
          </Card>

          <Card style={styles.group}>
            <Text style={styles.sectionTitle}>Fares and data sources</Text>
            <View style={styles.row}>
              <Text style={styles.rowText}>
                {`Jeepney fares: ${PUJ_CONFIG.source}, effective ${formatDate(PUJ_CONFIG.effectiveDate)}`}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>{`Tricycle fares: ${TRICYCLE_CONFIG.source}`}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Map data © OpenStreetMap contributors</Text>
            </View>
          </Card>

          <Card style={styles.group}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <View style={styles.row}>
              <Text style={styles.bodyText}>
                Location is used only to confirm you are within 50 m of a terminal when you submit
                a report. It is handled in line with the Data Privacy Act of 2012 (RA 10173).
              </Text>
            </View>
            <View style={[styles.row, styles.rowBetween]}>
              <Text style={styles.rowLabel}>Location permission</Text>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: colors.line, true: colors.transit }}
                thumbColor={colors.surface}
                accessibilityLabel="Location permission"
              />
            </View>
          </Card>

          <Card style={styles.group}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.row}>
              <Text style={styles.appName}>Indang Transit</Text>
              <Text style={styles.rowMuted}>{`Version ${version}`}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.bodyText}>
                An informational tool. It is not an emergency dispatch service or an official
                transport authority. Actual fares may vary.
              </Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>

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
            {LANGUAGES.map((option) => {
              const active = option === language;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setLanguage(option);
                    setDropdown(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.modalItem, active && styles.modalItemSelected]}>
                  <View style={styles.modalItemRow}>
                    <Text style={[styles.modalItemText, active && styles.modalItemTextSelected]}>
                      {option}
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
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  group: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.semibold,
    letterSpacing: 0.3,
  },
  row: {
    minHeight: touch.min,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowStack: {
    gap: spacing.sm,
  },
  rowLabel: {
    color: colors.ink,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.medium,
    flexShrink: 1,
  },
  rowText: {
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
  rowMuted: {
    color: colors.muted,
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
  },
  bodyText: {
    color: colors.muted,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
  appName: {
    color: colors.ink,
    fontSize: type.size.lg,
    lineHeight: type.line.lg,
    fontWeight: type.weight.bold,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: touch.min,
    minWidth: 140,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
  },
  selectValue: {
    color: colors.ink,
    fontSize: type.size.sm,
    lineHeight: type.line.sm,
  },
  selectGlyph: {
    color: colors.muted,
    fontSize: type.size.sm,
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
    fontSize: type.size.xs,
    lineHeight: type.line.xs,
    fontWeight: type.weight.medium,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.onTransit,
    fontWeight: type.weight.semibold,
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.transit,
    borderRadius: radii.sm,
  },
  offlineCheck: {
    color: colors.onTransit,
    fontSize: type.size.md,
    fontWeight: type.weight.bold,
  },
  offlineStatusText: {
    color: colors.onTransit,
    fontSize: type.size.md,
    lineHeight: type.line.md,
    fontWeight: type.weight.semibold,
  },
  updateButton: {
    flexShrink: 0,
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
