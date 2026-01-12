import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Assets } from '@/constants/Assets';

type CharacterDisplayProps = {
  skinColor?: 1 | 2 | 3;
  level?: number;
  equippedShirt?: string | null;
  equippedPants?: string | null;
  equippedEquipment?: string | null;
  equippedAccessory?: string | null;
  characterBackgroundUrl?: string | null; // This might be a URL or a key
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  skinColor = 1,
  level = 1,
  equippedShirt,
  equippedPants,
  equippedEquipment,
  equippedAccessory,
  characterBackgroundUrl,
  style,
  imageStyle,
}) => {
  // Determine stage based on level (1-5)
  // Stage 1: 1-9, Stage 2: 10-19, etc.
  const stageLevel = Math.min(5, Math.floor((level - 1) / 10) + 1);
  const stageKey = `stage${stageLevel}` as keyof typeof Assets.characters;
  const clothingStageKey = `stage${stageLevel}` as keyof typeof Assets.clothes.tops;
  
  // Get character body asset
  const bodyAsset = Assets.characters[stageKey]?.[skinColor] || Assets.characters.stage1[1];

  // Get clothing assets
  // Use stage-specific clothing if available, otherwise fallback to null or default behavior
  // The 'as any' is used because we're dynamically accessing properties based on strings
  const shirtAsset = equippedShirt ? (Assets.clothes.tops[clothingStageKey] as any)?.[equippedShirt] : null;
  const pantsAsset = equippedPants ? (Assets.clothes.bottoms[clothingStageKey] as any)?.[equippedPants] : null;
  const accessoryAsset = equippedAccessory ? (Assets.clothes.accessories[clothingStageKey] as any)?.[equippedAccessory] : null;
  
  // Equipment mapping remains simple
  // Note: Equipment names in database are likely capitalized e.g. "Dumbbells", mapping to "dumbbell" key
  const equipmentAsset = equippedEquipment 
    ? (Assets.equipment as any)?.[equippedEquipment.toLowerCase().replace(/s$/, '')] // rudimentary singularization for "Dumbbells" -> "dumbbell"
    : null;

  // Background handling
  // If characterBackgroundUrl starts with http, it's remote (from existing logic)
  // If it matches a key in Assets.backgrounds, use local
  const isRemoteBg = characterBackgroundUrl?.startsWith('http');
  const localBg = 
    !isRemoteBg && characterBackgroundUrl === 'Gym Floor' ? Assets.backgrounds.gym :
    !isRemoteBg && characterBackgroundUrl === 'Garage' ? null : 
    null;

  return (
    <View style={[styles.container, style]}>
      {/* Background Layer */}
      {characterBackgroundUrl === 'Garage' ? (
        <View style={[styles.layer, styles.background, { backgroundColor: '#2A2A2A' }, imageStyle]} />
      ) : characterBackgroundUrl && (
        <Image
          source={isRemoteBg ? { uri: characterBackgroundUrl } : (localBg || Assets.backgrounds.gym)}
          style={[styles.layer, styles.background, imageStyle]}
          resizeMode={isRemoteBg ? 'cover' : 'contain'}
          resizeMethod="scale"
          fadeDuration={0}
        />
      )}

      {/* Equipment Layer (behind body) */}
      {equipmentAsset && (
        <Image
          source={equipmentAsset}
          style={[styles.layer, styles.equipment, imageStyle]}
          resizeMode="contain"
          resizeMethod="scale"
          fadeDuration={0}
        />
      )}

      {/* Body Layer */}
      <Image
        source={bodyAsset}
        style={[styles.layer, styles.character, imageStyle]}
        resizeMode="contain"
        resizeMethod="scale"
        fadeDuration={0}
      />

      {/* Pants Layer (usually under shirt?) */}
      {pantsAsset && (
        <Image
          source={pantsAsset}
          style={[styles.layer, styles.clothes, imageStyle]}
          resizeMode="contain"
          resizeMethod="scale"
          fadeDuration={0}
        />
      )}

      {/* Shirt Layer */}
      {shirtAsset && (
        <Image
          source={shirtAsset}
          style={[styles.layer, styles.clothes, imageStyle]}
          resizeMode="contain"
          resizeMethod="scale"
          fadeDuration={0}
        />
      )}

      {/* Accessory Layer */}
      {accessoryAsset && (
        <Image
          source={accessoryAsset}
          style={[styles.layer, styles.clothes, imageStyle]}
          resizeMode="contain"
          resizeMethod="scale"
          fadeDuration={0}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure base container has zIndex
  },
  layer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  background: {
    zIndex: 0,
  },
  character: {
    zIndex: 2,
  },
  clothes: {
    zIndex: 3,
  },
  equipment: {
    zIndex: 1,
  },
});
