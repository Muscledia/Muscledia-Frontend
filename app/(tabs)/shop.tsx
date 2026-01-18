// screens/ShopScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Gem, Lock } from 'lucide-react-native';
import { useCharacter } from '@/hooks/useCharacter';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { BACKGROUNDS, SHOP_ITEMS } from '@/constants/GameItems';
import { Assets } from '@/constants/Assets';
import { Image } from 'react-native';

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { updateCharacter, character, purchaseItem, syncCoinsFromBackend } = useCharacter();
  const { impact } = useHaptics();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const shopCategories = [
    {
      title: 'Shirts',
      items: SHOP_ITEMS.SHIRTS
    },
    {
      title: 'Pants',
      items: SHOP_ITEMS.PANTS
    },
    {
      title: 'Equipment',
      items: SHOP_ITEMS.EQUIPMENT
    },
    {
      title: 'Accessories',
      items: SHOP_ITEMS.ACCESSORIES
    },
    {
      title: 'Backgrounds',
      items: BACKGROUNDS.filter(b => b.price > 0)
    }
  ];

  const handlePurchase = async (categoryTitle: string, item: any) => {
    if (isPurchasing) return;

    setIsPurchasing(true);

    try {
      const success = await purchaseItem(
        categoryTitle as any,
        item.name,
        item.price,
        item.url
      );

      if (success) {
        await impact('success');
        Alert.alert('Purchase Successful', `${item.name} has been added to your inventory!`);
      } else {
        await impact('warning');
        Alert.alert('Insufficient Coins', 'You need more coins to purchase this item. Complete workouts to earn coins!');
      }
    } catch (error: any) {
      await impact('error');
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const ShopItem = ({ item, categoryTitle }: { item: any; categoryTitle: string }) => {
    const isBackground = categoryTitle === 'Backgrounds' && item.url;

    const stageLevel = character.level < 30 ? 1 :
      character.level < 50 ? 2 :
        character.level < 80 ? 3 :
          character.level < 120 ? 4 : 5;
    const clothingStageKey = `stage${stageLevel}` as keyof typeof Assets.clothes.tops;

    let asset = (Assets.icons as any)?.[item.name];

    if (!asset) {
      if (categoryTitle === 'Shirts') {
        asset = (Assets.clothes.tops[clothingStageKey] as any)?.[item.name];
      } else if (categoryTitle === 'Pants') {
        asset = (Assets.clothes.bottoms[clothingStageKey] as any)?.[item.name];
      } else if (categoryTitle === 'Accessories') {
        asset = (Assets.clothes.accessories[clothingStageKey] as any)?.[item.name];
      } else if (categoryTitle === 'Equipment') {
        // Fallback if needed
      }
    }

    const isOwned = (
      categoryTitle === 'Shirts' ? character.ownedShirts.includes(item.name) :
        categoryTitle === 'Pants' ? character.ownedPants.includes(item.name) :
          categoryTitle === 'Equipment' ? character.ownedEquipment.includes(item.name) :
            categoryTitle === 'Accessories' ? character.ownedAccessories.includes(item.name) :
              categoryTitle === 'Backgrounds' ? character.ownedBackgrounds.includes(item.url || '') :
                false
    );

    const canAfford = character.coins >= item.price;

    const isLocked = item.unlockLevel && character.level < item.unlockLevel;

    return (
      <TouchableOpacity
        onPress={async () => {
          if (isLocked) {
              await impact('warning');
              Alert.alert('Locked', `Unlock this item at Level ${item.unlockLevel}`);
              return;
          }
          if (isOwned || isPurchasing) {
            await impact('selection');
            return;
          }
          handlePurchase(categoryTitle, item);
        }}
        activeOpacity={0.9}
        disabled={isOwned || isPurchasing}
        style={[
          styles.shopItem,
          (!canAfford && !isOwned) && styles.shopItemDisabled,
        ]}
      >
        <LinearGradient
          colors={isLocked ? ['#ccc', '#bbb'] : [theme.accent, theme.accentSecondary]}
          locations={[0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shopItemInner}
        >
          <View style={styles.itemHeader}>
            {asset ? (
              <Image source={asset} style={{ width: 60, height: 60, resizeMode: 'contain', marginBottom: 8, opacity: isLocked ? 0.5 : 1 }} />
            ) : (
              <Text style={[styles.itemIcon, { color: theme.cardText }]}>{item.icon}</Text>
            )}
            <Text style={[styles.itemName, { color: theme.cardText }]}>{item.name}</Text>
          </View>
          <View style={styles.itemFooter}>
            <View style={styles.priceContainer}>
              {isLocked ? (
                  <>
                    <Lock size={16} color={theme.cardText} />
                    <Text style={[styles.itemPrice, { color: theme.cardText }]}>Lvl {item.unlockLevel}</Text>
                  </>
              ) : (
                  <>
                    <Gem size={16} color={theme.cardText} />
                    <Text style={[
                styles.itemPrice,
                { color: theme.cardText },
                (!canAfford && !isOwned) && styles.itemPriceDisabled,
              ]}>
                {isOwned ? 'Owned' : item.price}
              </Text>
                  </>
              )}
            </View>
            {isPurchasing && (
              <ActivityIndicator size="small" color={theme.cardText} style={{ marginTop: 4 }} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Shop</Text>
        <View style={styles.balRow}>
          <Gem size={18} color={theme.accent} />
          <Text style={[styles.balText, { color: theme.accent }]}>{character.coins}</Text>
        </View>
      </View>
      <Text style={[styles.welcomeText, { color: theme.text }]}>
        Welcome to the shop! Treat yourself. Come to see{"\n"}what we have for you!
      </Text>

      {shopCategories.map((category, index) => (
        <View key={index} style={styles.categorySection}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.title}</Text>
          <View style={styles.itemsGrid}>
            {category.items.map((item, itemIndex) => (
              <ShopItem key={itemIndex} item={item} categoryTitle={category.title} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pageTitle: { fontSize: 20, fontWeight: '800' },
  balRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balText: { fontWeight: '800' },
  welcomeText: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  categorySection: { marginBottom: 32 },
  categoryTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  shopItem: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  shopItemDisabled: {
    opacity: 0.6,
  },
  shopItemInner: {
    padding: 16,
    borderRadius: 16,
  },
  itemHeader: { alignItems: 'center', marginBottom: 12 },
  itemIcon: { fontSize: 32, marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  itemFooter: { alignItems: 'center' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemPrice: { fontSize: 14, fontWeight: 'bold' },
  itemPriceDisabled: {
    textDecorationLine: 'line-through',
  },
});
