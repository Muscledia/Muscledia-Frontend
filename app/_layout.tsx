import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CharacterProvider } from '@/hooks/useCharacter';
import { WorkoutsProvider } from '@/hooks/useWorkouts';
import { RoutineProvider } from '@/hooks/useRoutines';
import { AuthProvider } from '@/hooks/useAuth';
import { RaidProvider } from '@/hooks/useRaid';
import { LeaguesProvider } from '@/hooks/useLeagues';
import { NotificationsProvider } from '@/hooks/useNotifications';

export default function RootLayout() {
  useFrameworkReady();

  // Force dark mode system UI
  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#0A0A0A');
  }, []);

  return (
    <AuthProvider>
      <WorkoutsProvider>
        <RoutineProvider>
          <CharacterProvider>
            <RaidProvider>
              <LeaguesProvider>
                <NotificationsProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="light" />
                </NotificationsProvider>
              </LeaguesProvider>
            </RaidProvider>
          </CharacterProvider>
        </RoutineProvider>
      </WorkoutsProvider>
    </AuthProvider>
  );
}