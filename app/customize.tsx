import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { getThemeColors } from '@/constants/Colors';
import { useCharacter } from '@/hooks/useCharacter';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterDisplay } from '@/components/CharacterDisplay';

export default function CustomizeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { character, updateCharacter } = useCharacter();
  const insets = useSafeAreaInsets();

  // Backgrounds - Garage is default (free), others must be owned
  const backgrounds = [
    { name: 'Garage', url: 'Garage', icon: '🏚️' },
    { name: 'Gym Floor', url: 'Gym Floor', icon: '🏟️' },
    { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', icon: '🏖️' },
    { name: 'Mountains', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', icon: '⛰️' },
    { name: 'Space', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1200&auto=format&fit=crop', icon: '🌌' },
  ];

  // Build owned items lists
  const shirts = character.ownedShirts || [];
  const pants = character.ownedPants || [];
  const equipment = character.ownedEquipment || [];
  const accessories = character.ownedAccessories || [];

  const CustomizationCard = ({ title, isActive, isOwned = true, onPress, children }: any) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={onPress}
      disabled={!isOwned}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[theme.accent, theme.accentSecondary]}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.itemCardInner, 
          isActive && { borderColor: '#FFF', borderWidth: 2 },
          !isOwned && { opacity: 0.7 } // Dim locked items slightly
        ]}
      >
        <View style={styles.cardContent}>
          {children}
          <Text style={[styles.itemLabel, { color: theme.cardText }]} numberOfLines={1}>{title}</Text>
        </View>
        
        {isActive && (
          <View style={styles.checkBadge}>
            <Check size={12} color={theme.accent} />
          </View>
        )}
        {!isOwned && (
          <View style={styles.lockOverlay}>
            <Lock size={20} color={theme.cardText} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ padding: 16, paddingTop: Math.max(16, (insets?.top || 0) + 8) }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Customize</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Character Preview */}
      <View style={[styles.previewContainer, { borderColor: theme.border, height: 450, alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: 302, height: 442, zIndex: 1 }}>
          <CharacterDisplay
            level={character.level}
            skinColor={character.skinColor}
            equippedShirt={character.equippedShirt}
            equippedPants={character.equippedPants}
            equippedEquipment={character.equippedEquipment}
            equippedAccessory={character.equippedAccessory}
            characterBackgroundUrl={character.characterBackgroundUrl}
            style={{ width: '100%', height: '100%', zIndex: 1 }}
            imageStyle={{ width: '100%', height: '100%' }}
          />
        </View>
      </View>

      {/* Skin Color Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Skin Tone</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {[
          { id: 1, color: '#F5D0C5', name: 'Light' },
          { id: 2, color: '#E0AC69', name: 'Medium' },
          { id: 3, color: '#8D5524', name: 'Dark' }
        ].map((tone) => (
          <CustomizationCard
            key={tone.id}
            title={tone.name}
            isActive={character.skinColor === tone.id}
            isOwned={true}
            onPress={() => updateCharacter({ skinColor: tone.id as 1 | 2 | 3 })}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tone.color, borderWidth: 2, borderColor: '#fff' }} />
          </CustomizationCard>
        ))}
      </ScrollView>

      {/* Backgrounds Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Backgrounds</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {backgrounds.map(bg => {
          const isOwned = character.ownedBackgrounds?.includes(bg.url) || bg.name === 'Garage';
          const isActive = character.characterBackgroundUrl === bg.url;
          return (
            <CustomizationCard
              key={bg.name}
              title={bg.name}
              isActive={isActive}
              isOwned={isOwned}
              onPress={() => updateCharacter({ characterBackgroundUrl: bg.url })}
            >
              {bg.url.startsWith('http') ? (
                <Image source={{ uri: bg.url }} style={styles.cardImage} />
              ) : (
                <Text style={{ fontSize: 32 }}>{bg.icon}</Text>
              )}
            </CustomizationCard>
          );
        })}
      </ScrollView>

      {/* Accessories Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Accessories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        <CustomizationCard
          title="None"
          isActive={!character.equippedAccessory}
          onPress={() => updateCharacter({ equippedAccessory: null })}
        >
          <Text style={{ fontSize: 24 }}>🚫</Text>
        </CustomizationCard>
        {accessories.length > 0 ? accessories.map(name => (
          <CustomizationCard
            key={name}
            title={name}
            isActive={character.equippedAccessory === name}
            onPress={() => updateCharacter({ equippedAccessory: name })}
          >
            <Text style={{ fontSize: 24 }}>🧣</Text>
          </CustomizationCard>
        )) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No accessories owned</Text>
        )}
      </ScrollView>

      {/* Shirts Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Shirts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        <CustomizationCard
          title="None"
          isActive={!character.equippedShirt}
          onPress={() => updateCharacter({ equippedShirt: null })}
        >
          <Text style={{ fontSize: 24 }}>🚫</Text>
        </CustomizationCard>
        {shirts.length > 0 ? shirts.map(name => (
          <CustomizationCard
            key={name}
            title={name}
            isActive={character.equippedShirt === name}
            onPress={() => updateCharacter({ equippedShirt: name })}
          >
            <Text style={{ fontSize: 24 }}>👕</Text>
          </CustomizationCard>
        )) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No shirts owned</Text>
        )}
      </ScrollView>

      {/* Pants Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Pants</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        <CustomizationCard
          title="None"
          isActive={!character.equippedPants}
          onPress={() => updateCharacter({ equippedPants: null })}
        >
          <Text style={{ fontSize: 24 }}>🚫</Text>
        </CustomizationCard>
        {pants.length > 0 ? pants.map(name => (
          <CustomizationCard
            key={name}
            title={name}
            isActive={character.equippedPants === name}
            onPress={() => updateCharacter({ equippedPants: name })}
          >
            <Text style={{ fontSize: 24 }}>👖</Text>
          </CustomizationCard>
        )) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No pants owned</Text>
        )}
      </ScrollView>

      {/* Equipment Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Equipment</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        <CustomizationCard
          title="None"
          isActive={!character.equippedEquipment}
          onPress={() => updateCharacter({ equippedEquipment: null })}
        >
          <Text style={{ fontSize: 24 }}>🚫</Text>
        </CustomizationCard>
        {equipment.length > 0 ? equipment.map(name => (
          <CustomizationCard
            key={name}
            title={name}
            isActive={character.equippedEquipment === name}
            onPress={() => updateCharacter({ equippedEquipment: name })}
          >
            <Text style={{ fontSize: 24 }}>🏋️</Text>
          </CustomizationCard>
        )) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No equipment owned</Text>
        )}
      </ScrollView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  previewContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 24,
    backgroundColor: '#1a1a1a', // Fallback dark bg for Garage
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 12, paddingHorizontal: 4 },
  horizontalScroll: { paddingRight: 20, gap: 12, paddingBottom: 16 },
  itemCard: {
    width: 140, // Wider like shop
    height: 140,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  itemCardInner: { 
    flex: 1,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardImage: { width: 80, height: 80, borderRadius: 8 },
  itemLabel: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  checkBadge: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: '#FFF',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: { fontStyle: 'italic', marginLeft: 4, marginTop: 12 }
});
