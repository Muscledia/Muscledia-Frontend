import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CharacterProvider } from '@/hooks/useCharacter';
import { WorkoutsProvider } from '@/hooks/useWorkouts';
import { RoutineProvider } from '@/hooks/useRoutines';
import { AuthProvider } from '@/hooks/useAuth';
import { RaidProvider } from '@/hooks/useRaid';
import { NotificationsProvider } from '@/hooks/useNotifications';
import { Colors } from '@/constants/Colors';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      NavigationBar.setBackgroundColorAsync(Colors.dark.background);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <WorkoutsProvider>
        <RoutineProvider>
          <CharacterProvider>
            <RaidProvider>
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
                  <Stack.Screen 
                    name="workout-plan-detail/[id]" 
                    options={{ 
                      headerShown: true,
                      headerTitle: 'Workout Plan',
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
            </RaidProvider>
          </CharacterProvider>
        </RoutineProvider>
        </WorkoutsProvider>
      </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}