import { Tabs } from 'expo-router';
import { House, Dumbbell, ShoppingBag, User, Plus, Target, Award } from 'lucide-react-native';
import { useColorScheme, TouchableOpacity, View, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useHaptics } from '@/hooks/useHaptics';
import { LinearGradient } from 'expo-linear-gradient';

const FloatingActionButton = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { width } = Dimensions.get('window');
  const { impact } = useHaptics();
  
  return (
    <TouchableOpacity
      onPress={async () => { await impact('medium'); router.push('/workout-plans/create'); }}
      activeOpacity={0.9}
      style={{
        position: 'absolute',
        bottom: 55,
        left: width / 2 - 28,
        width: 56,
        height: 56,
        zIndex: 1000,
      }}
    >
      <LinearGradient
        colors={[theme.accent, theme.accentSecondary]}
        locations={[0, 1]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          transform: [{ rotate: '45deg' }],
        }}
      >
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <Plus size={28} color={theme.cardText} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
          headerTitle: 'Muscledia',
                     headerLeft: () => (
            <TouchableOpacity 
              onPress={async () => { await impact('light'); router.push('/profile'); }}
              style={{ marginLeft: 16 }}
            >
              <User size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
          headerShown: false,
        }}
      />
      

      
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
          headerTitle: 'Equipment Shop',
        }}
      />
      
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Badges',
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
          headerTitle: 'Badges',
        }}
      />

      
      
      <Tabs.Screen
        name="exercises"
        options={{
          href: null,
        }}
      />
    </Tabs>
    <FloatingActionButton />
    </View>
  );
}
