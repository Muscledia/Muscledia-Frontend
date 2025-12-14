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

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { updateCharacter, character, addCoins, purchaseItem } = useCharacter();
  const { impact } = useHaptics();

  const shopCategories = [
    {
      title: 'Shirts',
      items: [
        { name: 'Basic Tee', price: 50, icon: '👕' },
        { name: 'Tank Top', price: 75, icon: '👕' },
        { name: 'Muscle Shirt', price: 100, icon: '👕' },
        { name: 'Pro Shirt', price: 150, icon: '👕' },
      ]
    },
    {
      title: 'Pants',
      items: [
        { name: 'Shorts', price: 60, icon: '🩳' },
        { name: 'Joggers', price: 80, icon: '👖' },
        { name: 'Pro Pants', price: 120, icon: '👖' },
        { name: 'Elite Gear', price: 200, icon: '👖' },
      ]
    },
    {
      title: 'Equipment',
      items: [
        { name: 'Dumbbells', price: 300, icon: '🏋️' },
        { name: 'Barbell', price: 500, icon: '🏋️' },
      ]
    },
    {
      title: 'Accessories',
      items: [
        { name: 'Wristbands', price: 40, icon: '🥊' },
        { name: 'Headband', price: 60, icon: '🤕' },
      ]
    },
    {
      title: 'Backgrounds',
      items: [
        { name: 'Gym Floor', price: 100, icon: '🏟️', url: 'Gym Floor' },
        { name: 'Beach', price: 150, icon: '🏖️', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Mountains', price: 200, icon: '⛰️', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Space', price: 300, icon: '🌌', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1200&auto=format&fit=crop' },
      ]
    }
  ];

  const handleSelectBackground = (url: string) => {
    updateCharacter({ characterBackgroundUrl: url });
    impact('success');
    Alert.alert('Background Updated', 'Your character background has been set.');
  };

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
          if (isBackground && item.url) handleSelectBackground(item.url);
          else handlePurchase(categoryTitle, item);
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
          <TouchableOpacity onPress={async () => { addCoins(500); await impact('success'); }} style={styles.addBtn}>
            <LinearGradient colors={[theme.accent, theme.accentSecondary]} locations={[0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtnInner}>
              <Text style={[styles.addBtnText, { color: theme.cardText }]}>+500</Text>
            </LinearGradient>
          </TouchableOpacity>
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