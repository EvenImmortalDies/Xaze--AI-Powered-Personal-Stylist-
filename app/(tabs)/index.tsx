import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/E0E0E0/333333?text=No+Image';

export default function TabsHome() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- Auth check ---
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login'); // redirect to login if not logged in
    }
  }, [user, loading]);

  // --- Fetch products ---
  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        setError(error.message);
      } else {
        setProducts(data);
      }
    } catch (e) {
      setError('Network or unexpected error');
    }
  };

  const handleProductPress = (product) => setSelectedProduct(product);
  const handleBuyNowPress = (link) => link && Linking.openURL(link).catch(console.error);

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking session…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  // If product is selected, show details
  if (selectedProduct) {
    const images = [];
    for (let i = 1; i <= 7; i++) {
      const imageUrl = selectedProduct[`image_url${i}`];
      if (imageUrl) images.push(imageUrl);
    }

    return (
      <View style={styles.detailsContainer}>
        <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView>
          <FlatList
            data={images.length > 0 ? images : [PLACEHOLDER_IMAGE]}
            horizontal
            pagingEnabled
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.detailsImage} />}
          />
          <View style={styles.detailsContent}>
            <Text style={styles.detailsName}>{selectedProduct.name}</Text>
            <Text style={styles.detailsPrice}>₹{selectedProduct.price}</Text>
            <Text>Brand: {selectedProduct.brand}</Text>
            <Text>Category: {selectedProduct.category}</Text>
            <Text>{selectedProduct.description}</Text>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyNowPress(selectedProduct.link)}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- Products list view ---
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.email}</Text>
      <TouchableOpacity onPress={signOut} style={{ marginBottom: 10 }}>
        <Text style={{ color: 'blue' }}>Sign Out</Text>
      </TouchableOpacity>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProductPress(item)} style={styles.productCard}>
            <Image source={{ uri: item.image_url1 || PLACEHOLDER_IMAGE }} style={styles.productImage} />
            <Text>{item.name}</Text>
            <Text>₹{item.price}</Text>
          </TouchableOpacity>
        )}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  productCard: { flex: 1, margin: 5, backgroundColor: '#fff', padding: 10, borderRadius: 10 },
  productImage: { width: '100%', height: 150, borderRadius: 8 },
  detailsContainer: { flex: 1 },
  backButton: { position: 'absolute', top: 20, left: 10, zIndex: 1 },
  backButtonText: { fontSize: 18, fontWeight: 'bold' },
  detailsImage: { width: 400, height: 400, resizeMode: 'contain' },
  detailsContent: { padding: 20 },
  detailsName: { fontSize: 24, fontWeight: 'bold' },
  detailsPrice: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  buyButton: { backgroundColor: '#4c7c8b', padding: 15, margin: 20, borderRadius: 10 },
  buyButtonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
});
