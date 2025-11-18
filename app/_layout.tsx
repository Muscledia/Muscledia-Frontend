import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CharacterProvider } from '@/hooks/useCharacter';
import { WorkoutsProvider } from '@/hooks/useWorkouts';
import { RoutineProvider } from '@/hooks/useRoutines';
import { AuthProvider } from '@/hooks/useAuth';
import { RaidProvider } from '@/hooks/useRaid';
import { LeaguesProvider } from '@/hooks/useLeagues';
import { NotificationsProvider } from '@/hooks/useNotifications';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  useFrameworkReady();

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
                  <Stack.Screen 
                    name="public-routines" 
                    options={{ 
                      headerShown: true,
                      headerTitle: 'Discover Routines',
                      headerBackTitle: 'Back',
                      headerStyle: {
                        backgroundColor: Colors.dark.background,
                      },
                      headerTintColor: Colors.primary,
                      headerTitleStyle: {
                        fontWeight: 'bold',
                        color: Colors.dark.text,
                      },
                    }} 
                  />
                  <Stack.Screen 
                    name="routine-detail/[id]" 
                    options={{ 
                      headerShown: true,
                      headerTitle: 'Routine Details',
                      headerBackTitle: 'Back',
                      headerStyle: {
                        backgroundColor: Colors.dark.background,
                      },
                      headerTintColor: Colors.primary,
                      headerTitleStyle: {
                        fontWeight: 'bold',
                        color: Colors.dark.text,
                      },
                    }} 
                  />
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