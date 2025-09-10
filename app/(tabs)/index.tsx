import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';

// 🔑 Supabase credentials
const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    console.log("Attempting to fetch data from Supabase...");
    try {
      // Correcting the column name to "image_url1"
      const { data, error } = await supabase.from("products").select("*, image_url1");
      if (error) {
        setError(error.message);
        console.error("Supabase fetch error:", error);
      } else {
        setProducts(data);
        setError(null);
        console.log("Successfully fetched products:", data.length);
      }
    } catch (e) {
      setError("An unexpected error occurred during fetch. This may be a network issue.");
      console.error("Unexpected fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderProductItem = ({ item }) => {
    // Check if the image_url1 property exists and has a value
    const imageUrl = item.image_url1 || 'https://via.placeholder.com/150';

    return (
      <View style={styles.productCard}>
        {/* The image is now displayed using the correct column name */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={styles.productBrand}>Brand: {item.brand}</Text>
          <Text style={styles.productCategory}>Category: {item.category}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>Error:</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Products from Supabase</Text>
      {products.length === 0 ? (
        <Text style={styles.noProductsText}>No products found.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#4c7c8b',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#718096',
  },
  productCategory: {
    fontSize: 14,
    color: '#718096',
  },
  statusText: {
    fontSize: 18,
    marginTop: 20,
    color: '#555',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginTop: 10,
  },
  noProductsText: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
  }
});
