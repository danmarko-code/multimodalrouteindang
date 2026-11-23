import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LiveProvider } from '@/data/live';

export default function RootLayout() {
  return (
    <LiveProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="results" />
        <Stack.Screen name="route-detail" />
        <Stack.Screen name="report" />
      </Stack>
    </LiveProvider>
  );
}
