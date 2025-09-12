// app/(tabs)/home.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: '1', title: 'Pairing & Styling', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_pairing.png' },
  { id: '2', title: 'Products', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_products.png' },
  { id: '3', title: 'Outfits', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_outfits.png' },
  { id: '4', title: 'Fit Check', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_fitcheck.png' },
  { id: '5', title: 'Accessorize', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_accessorize.png' },
  { id: '6', title: 'Will this suit me?', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_suitme.png' },
];

const CATEGORIES = [
  { id: '1', label: 'T-shirts', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_tshirt.png' },
  { id: '2', label: 'Shirts', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_shirts.png' },
  { id: '3', label: 'Jeans', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_jeans.png' },
  { id: '4', label: 'Trousers', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_trousers.png' },
  { id: '5', label: 'Shorts', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_shorts.png' },
  { id: '6', label: 'Footwear', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_footwear.png' },
];

const OCCASIONS = [
  { id: '1', label: 'College', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_college.png' },
  { id: '2', label: 'Office', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_office.png' },
  { id: '3', label: 'Travel', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_travel.png' },
  { id: '4', label: 'Night Out', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_nightout.png' },
  { id: '5', label: 'Festive', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_festive.png' },
  { id: '6', label: 'Date', image: 'https://xetomtmbtiqwfisynrrl.supabase.co/storage/v1/object/public/home/home_date.png' },
];

const PRICE_BUCKETS = ['Under ₹500', 'Under ₹1000', 'Under ₹2000'];

export default function TabsHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 8, color: '#6b7280' }}>Checking session…</Text>
      </View>
    );
  }

  const searchSubmit = () => {
    if (!query.trim()) return;
    // navigate to search results page; adjust as per your router structure
    router.push({ pathname: '/xaze', params: { query: query.trim() } });
    setQuery('');
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>xaze</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bell" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="cart-outline" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.searchInner}>
            <Feather name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Ask your personal stylist"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={searchSubmit}
            />
            <TouchableOpacity onPress={searchSubmit} style={styles.cameraBtn}>
              <Feather name="camera" size={18} color="#6b7280" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Quick Action Tiles (2 rows x 3 cols) */}
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((card) => (
            <TouchableOpacity key={card.id} style={styles.actionCard}>
              <Text style={styles.actionTitle} numberOfLines={2}>{card.title}</Text>
              <View style={styles.actionImageWrap}>
              <Image source={{ uri: card.image }} style={styles.actionImage} />
            </View>

            </TouchableOpacity>
          ))}
        </View>

        {/* Style By Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style By Category</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.categoryCard}>
                <Text style={styles.categoryLabel}>{item.label}</Text>
                <Image source={{ uri: item.image }} style={styles.categoryImage} />

              </TouchableOpacity>
            )}
          />
        </View>

        {/* Style By Occasions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style By Occasions</Text>
          <FlatList
            data={OCCASIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.occasionCard}>
                <Text style={styles.occasionLabel}>{item.label}</Text>
<Image source={{ uri: item.image }} style={styles.occasionImage} />

              </TouchableOpacity>
            )}
          />
        </View>

        {/* Shop By Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop By Price</Text>
          <FlatList
            data={PRICE_BUCKETS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <View style={styles.priceCard}>
                <Text style={styles.priceText}>{item}</Text>
              </View>
            )}
          />
        </View>

        {/* spacing to avoid footer overlap */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const GAP = 12;
const ACTION_SIZE = (SCREEN_WIDTH - 16 * 2 - GAP * 2) / 3; // three columns

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: Platform.OS === 'android' ? 36 : 56, paddingHorizontal: 16, paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo: { fontSize: 32, fontWeight: '800', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 8, padding: 8, borderRadius: 10 },

  /* Search */
  searchWrap: { marginBottom: 16 },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#fff',
  },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 15, color: '#111827' },
  cameraBtn: { padding: 6 },

  /* Quick actions grid 3 cols */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: GAP,
    marginBottom: 22,
  },
  actionCard: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    padding: 10,
    overflow: 'hidden',
  },
  actionImageWrap: {
    position: 'absolute',
    top: 20,
    left: 8,
    right: 8,
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
    marginTop: 25,  
  },
  actionTitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#111827', 
    textAlign: 'center', 
    marginBottom: 6
  },

  /* Sections */
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },

  /* Horizontal lists */
  horizontalList: { paddingLeft: 2, paddingRight: 8 },

  /* Category small cards */
  categoryCard: {
    width: 84,
    height: 104,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: 8,                
    overflow: 'hidden',
  },
  categoryImage: { 
    width: '90%', 
    height: '65%', 
    resizeMode: 'contain'
  },

  categoryLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 6               // ⬅ add space between text and image
  },
  /* Occasion larger cards */
  occasionCard: {
    width: 118,
    height: 160,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start', // ⬅ changed
    paddingTop: 10,               // ⬅ add padding top
  },
  occasionImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover'
  },
  occasionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8               // ⬅ add spacing
  },

  /* Price chips */
  priceCard: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceText: { fontSize: 16, fontWeight: '700', color: '#111827' },

  /* Footer Tabs */
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    height: 70,
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, marginTop: 4, fontWeight: '600', color: '#111827' },
  tabLabelInactive: { fontSize: 12, marginTop: 4, color: '#6b7280' },
});