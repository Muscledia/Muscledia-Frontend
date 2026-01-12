import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Image, Dimensions, Platform } from 'react-native';
import { getThemeColors } from '@/constants/Colors';
import { useCharacter } from '@/hooks/useCharacter';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Lock, ShoppingBag } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterDisplay } from '@/components/CharacterDisplay';
import { BACKGROUNDS } from '@/constants/GameItems';

type CategoryType = 'BODY' | 'SHIRTS' | 'PANTS' | 'GEAR' | 'BG';

const { width, height } = Dimensions.get('window');

export default function CustomizeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { character, updateCharacter } = useCharacter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('SHIRTS');

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'BODY', label: 'Body' },
    { id: 'SHIRTS', label: 'Tops' },
    { id: 'PANTS', label: 'Bottoms' },
    { id: 'GEAR', label: 'Gear' },
    { id: 'BG', label: 'Scene' },
  ];

  // Owned items
  const shirts = character.ownedShirts || [];
  const pants = character.ownedPants || [];
  const equipment = character.ownedEquipment || [];
  const accessories = character.ownedAccessories || [];

  const CustomizationItem = ({ title, isActive, isOwned = true, onPress, children, type = 'standard' }: any) => {
    return (
      <TouchableOpacity 
        style={[
          styles.gridItem, 
          { backgroundColor: theme.background },
          isActive && { borderColor: theme.accent, borderWidth: 2 },
          !isOwned && { opacity: 0.6 }
        ]}
        onPress={onPress}
        disabled={!isOwned}
        activeOpacity={0.7}
      >
        <View style={styles.itemPreview}>
          {children}
        </View>
        <Text style={[styles.itemLabel, { color: theme.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
        
        {isActive && (
          <View style={[styles.activeBadge, { backgroundColor: theme.accent }]}>
            <Check size={10} color={theme.cardText} />
          </View>
        )}
        {!isOwned && (
          <View style={styles.lockBadge}>
            <Lock size={12} color={theme.textMuted} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'BODY':
        return (
          <View style={styles.gridContainer}>
             <View style={styles.row}>
              {[
                { id: 1, color: '#F5D0C5', name: 'Light' },
                { id: 2, color: '#E0AC69', name: 'Medium' },
                { id: 3, color: '#8D5524', name: 'Dark' }
              ].map((tone) => (
                <CustomizationItem
                  key={tone.id}
                  title={tone.name}
                  isActive={character.skinColor === tone.id}
                  isOwned={true}
                  onPress={() => updateCharacter({ skinColor: tone.id as 1 | 2 | 3 })}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: tone.color }]} />
                </CustomizationItem>
              ))}
             </View>
          </View>
        );
      
      case 'SHIRTS':
        return (
          <View style={styles.gridContainer}>
            <CustomizationItem
              title="None"
              isActive={!character.equippedShirt}
              onPress={() => updateCharacter({ equippedShirt: null })}
            >
              <Text style={{ fontSize: 24 }}>🚫</Text>
            </CustomizationItem>
            {shirts.map(name => (
              <CustomizationItem
                key={name}
                title={name}
                isActive={character.equippedShirt === name}
                onPress={() => updateCharacter({ equippedShirt: name })}
              >
                <Text style={{ fontSize: 28 }}>👕</Text>
              </CustomizationItem>
            ))}
            <TouchableOpacity 
              style={[styles.shopButton, { borderColor: theme.accent }]}
              onPress={() => router.push('/shop')}
            >
              <ShoppingBag size={20} color={theme.accent} />
              <Text style={[styles.shopButtonText, { color: theme.accent }]}>Get More Tops</Text>
            </TouchableOpacity>
          </View>
        );

      case 'PANTS':
        return (
          <View style={styles.gridContainer}>
            <CustomizationItem
              title="None"
              isActive={!character.equippedPants}
              onPress={() => updateCharacter({ equippedPants: null })}
            >
              <Text style={{ fontSize: 24 }}>🚫</Text>
            </CustomizationItem>
            {pants.map(name => (
              <CustomizationItem
                key={name}
                title={name}
                isActive={character.equippedPants === name}
                onPress={() => updateCharacter({ equippedPants: name })}
              >
                <Text style={{ fontSize: 28 }}>👖</Text>
              </CustomizationItem>
            ))}
            <TouchableOpacity 
              style={[styles.shopButton, { borderColor: theme.accent }]}
              onPress={() => router.push('/shop')}
            >
              <ShoppingBag size={20} color={theme.accent} />
              <Text style={[styles.shopButtonText, { color: theme.accent }]}>Get More Pants</Text>
            </TouchableOpacity>
          </View>
        );

      case 'GEAR':
        return (
          <View style={styles.gridContainer}>
            <View style={styles.row}>
              <CustomizationItem
                title="Empty"
                isActive={!character.equippedEquipment}
                onPress={() => updateCharacter({ equippedEquipment: null })}
              >
                <Text style={{ fontSize: 24 }}>🚫</Text>
              </CustomizationItem>
              {equipment.map(name => (
                <CustomizationItem
                  key={name}
                  title={name}
                  isActive={character.equippedEquipment === name}
                  onPress={() => updateCharacter({ equippedEquipment: name })}
                >
                  <Text style={{ fontSize: 28 }}>🏋️</Text>
                </CustomizationItem>
              ))}
            </View>

            <View style={{height: 24}}/>

            <Text style={[styles.subHeader, { color: theme.text }]}>Accessories</Text>
            <View style={styles.row}>
              <CustomizationItem
                title="None"
                isActive={!character.equippedAccessory}
                onPress={() => updateCharacter({ equippedAccessory: null })}
              >
                <Text style={{ fontSize: 24 }}>🚫</Text>
              </CustomizationItem>
              {accessories.map(name => (
                <CustomizationItem
                  key={name}
                  title={name}
                  isActive={character.equippedAccessory === name}
                  onPress={() => updateCharacter({ equippedAccessory: name })}
                >
                  <Text style={{ fontSize: 28 }}>🧣</Text>
                </CustomizationItem>
              ))}
            </View>
          </View>
        );

      case 'BG':
        return (
          <View style={styles.gridContainer}>
            {BACKGROUNDS.map(bg => {
              const isOwned = character.ownedBackgrounds?.includes(bg.url) || bg.name === 'Garage';
              const isActive = character.characterBackgroundUrl === bg.url;
              return (
                <CustomizationItem
                  key={bg.name}
                  title={bg.name}
                  isActive={isActive}
                  isOwned={isOwned}
                  onPress={() => updateCharacter({ characterBackgroundUrl: bg.url })}
                >
                  {bg.url.startsWith('http') ? (
                    <Image source={{ uri: bg.url }} style={styles.bgThumbnail} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>{bg.icon}</Text>
                  )}
                </CustomizationItem>
              );
            })}
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* 1. Top Section: Character Preview (Fixed 45% height) */}
      <View style={[styles.previewArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
           <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            >
              <ArrowLeft size={20} color="#FFF" />
           </TouchableOpacity>
        </View>

        <View style={styles.characterWrapper}>
          <CharacterDisplay
            level={character.level}
            skinColor={character.skinColor}
            equippedShirt={character.equippedShirt}
            equippedPants={character.equippedPants}
            equippedEquipment={character.equippedEquipment}
            equippedAccessory={character.equippedAccessory}
            characterBackgroundUrl={character.characterBackgroundUrl}
            style={{ width: '100%', height: '100%' }}
            imageStyle={{ width: '100%', height: '100%' }}
          />
        </View>
        
        {/* Gradient fade to seamlessly blend into bottom sheet */}
        <LinearGradient
          colors={['transparent', theme.surface]}
          style={styles.fadeOverlay}
        />
      </View>

      {/* 2. Bottom Section: Controls (BottomSheet style) */}
      <View style={[styles.controlsSheet, { backgroundColor: theme.surface }]}>
        
        {/* Category Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.tabPill,
                  activeCategory === cat.id ? { backgroundColor: theme.accent } : { backgroundColor: theme.background }
                ]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text 
                  style={[
                    styles.tabText,
                    { color: activeCategory === cat.id ? theme.cardText : theme.textMuted }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Area */}
        <ScrollView 
          style={styles.contentScroll} 
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Preview Section
  previewArea: {
    height: height * 0.45,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    position: 'absolute',
    top: 50, // Safe area handled by padding
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 2,
  },

  // Controls Section
  controlsSheet: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24, // Overlap slightly
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  
  tabsWrapper: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  
  // Grid/List Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subHeader: {
    width: '100%',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  
  // Item Card
  gridItem: {
    width: (width - 40 - 24) / 3, // Calculated width: (Screen - Padding*2 - Gap*2) / 3
    height: 110,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  itemPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  activeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  
  // Content Assets
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bgThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  
  // Shop Button
  shopButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 12,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
