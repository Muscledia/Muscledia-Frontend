import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Gem } from 'lucide-react-native';
import { useCharacter } from '@/hooks/useCharacter';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { BACKGROUNDS, SHOP_ITEMS } from '@/constants/GameItems';

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { updateCharacter, character, addCoins, purchaseItem } = useCharacter();
  const { impact } = useHaptics();

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
      items: BACKGROUNDS
    }
  ];

  const handlePurchase = async (categoryTitle: string, item: any) => {
    const ok = purchaseItem(categoryTitle as any, item.name, item.price, item.url);
    if (ok) {
      await impact('success');
      Alert.alert('Purchased', `${item.name} acquired!`);
    } else {
      await impact('warning');
      Alert.alert('Not enough coins', 'Earn more coins to buy this item.');
    }
  };

  const ShopItem = ({ item, categoryTitle }: { item: any; categoryTitle: string }) => {
    const isBackground = categoryTitle === 'Backgrounds' && item.url;
    const isOwned = (
      categoryTitle === 'Shirts' ? character.ownedShirts.includes(item.name) :
      categoryTitle === 'Pants' ? character.ownedPants.includes(item.name) :
      categoryTitle === 'Equipment' ? character.ownedEquipment.includes(item.name) :
      categoryTitle === 'Accessories' ? character.ownedAccessories.includes(item.name) :
      categoryTitle === 'Backgrounds' ? character.ownedBackgrounds.includes(item.url || '') :
      false
    );

    return (
      <TouchableOpacity 
        onPress={async () => { 
          if (isOwned) { await impact('selection'); return; }
          handlePurchase(categoryTitle, item);
        }}
        activeOpacity={0.9}
        style={styles.shopItem}
      >
        <LinearGradient
          colors={[theme.accent, theme.accentSecondary]}
          locations={[0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shopItemInner}
        >
          <View style={styles.itemHeader}>
            <Text style={[styles.itemIcon, { color: theme.cardText }]}>{item.icon}</Text>
            <Text style={[styles.itemName, { color: theme.cardText }]}>{item.name}</Text>
          </View>
          <View style={styles.itemFooter}>
            <View style={styles.priceContainer}>
              <Gem size={16} color={theme.cardText} />
              <Text style={[styles.itemPrice, { color: theme.cardText }]}>{isOwned ? 'Owned' : item.price}</Text>
            </View>
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
  addBtn: { marginLeft: 8 },
  addBtnInner: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  addBtnText: { fontWeight: '700', fontSize: 12 },
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
}); 