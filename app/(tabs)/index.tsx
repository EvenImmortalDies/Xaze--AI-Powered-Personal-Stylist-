import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/E0E0E0/333333?text=No+Image';

// Mock data for the static UI cards
const actionCards = [
  { id: '1', title: 'Pairing & Styling', image: 'https://i.ibb.co/6P2T8Yx/image.png' },
  { id: '2', title: 'Products', image: 'https://i.ibb.co/gT7hS4Q/image.png' },
  { id: '3', title: 'Outfits', image: 'https://i.ibb.co/VMyh2p8/image.png' },
  { id: '4', title: 'Fit Check', image: 'https://i.ibb.co/r71fNfD/image.png' },
  { id: '5', title: 'Accessorize', image: 'https://i.ibb.co/hgf8J9T/image.png' },
  { id: '6', title: 'Will this suit me?', image: 'https://i.ibb.co/wCxD13P/image.png' },
];

const categoryCards = [
  { id: '1', title: 'T-shirts', image: 'https://i.ibb.co/Yc56L4H/image.png' },
  { id: '2', title: 'Shirts', image: 'https://i.ibb.co/P4Jp8YF/image.png' },
  { id: '3', title: 'Jeans', image: 'https://i.ibb.co/n6z412q/image.png' },
  { id: '4', title: 'Trousers', image: 'https://i.ibb.co/Rz5fR2G/image.png' },
  { id: '5', title: 'Shorts', image: 'https://i.ibb.co/Wc63V9P/image.png' },
  { id: '6', title: 'Footwear', image: 'https://i.ibb.co/tZ5Q67w/image.png' },
];

export default function TabsHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  // --- Start of change ---
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      return;
    }
    // Navigate to the 'xaze' page and pass the search query as a parameter.
    router.push({
      pathname: '/xaze', // Make sure this path is correct for your 'xaze' page.
      params: { query: searchQuery.trim() }
    });
    setSearchQuery(''); // Clear the search bar
  };
  // --- End of change ---

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking session…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>XAZE</Text>
        <View style={styles.headerIcons}>
          <Feather name="bell" size={24} color="#333" style={{ marginRight: 15 }} />
          <Ionicons name="cart-outline" size={24} color="#333" />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <LinearGradient
          colors={['#ffffff', '#f3f4f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.searchGradient}
        >
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask for pairing ideas"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!isSearching}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Feather name="camera" size={24} color="#6b7280" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Action Cards */}
      <View style={styles.sectionContainer}>
        <View style={styles.gridContainer}>
          {actionCards.map((card) => (
            <TouchableOpacity key={card.id} style={styles.gridItem}>
              <Image source={{ uri: card.image }} style={styles.gridImage} />
              <Text style={styles.gridText}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Style By Category */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Style By Category</Text>
        <FlatList
          horizontal
          data={categoryCards}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryCard}>
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Style By Occasions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Style By Occasions</Text>
        <FlatList
          horizontal
          data={categoryCards} // Reusing mock data for demonstration
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryCard}>
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  searchBarContainer: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  searchGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridItem: {
    width: '32%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
  },
  gridText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    zIndex: 1,
    position: 'absolute',
    top: 8,
    left: 8,
  },
  categoryCard: {
    width: 80,
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
  },
  categoryImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    zIndex: 1,
    position: 'absolute',
    top: 8,
  },
});