import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Supabase credentials
const supabaseUrl = "Supabase URL";
const supabaseAnonKey = "Anon KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// A placeholder image to use when an image URL is not available
const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/E0E0E0/333333?text=No+Image';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      // Fetch all columns to get all available image URLs
      const { data, error } = await supabase.from("products").select("*");
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

  const handleProductPress = (product) => {
    setSelectedProduct(product);
  };

  const handleBuyNowPress = (productLink) => {
    if (productLink) {
      Linking.openURL(productLink).catch(err => {
        console.error("Failed to open URL:", err);
      });
    }
  };

  // The main view for a single product card in the list
  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)} style={styles.productCard}>
      <Image
        source={{ uri: item.image_url1 || PLACEHOLDER_IMAGE }}
        style={styles.productImage}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // The view for the full product details page
  const renderProductDetails = () => {
    if (!selectedProduct) return null;

    // Collect all image URLs into an array for the gallery
    const images = [];
    for (let i = 1; i <= 7; i++) { // Assuming up to 7 image columns
      const imageUrl = selectedProduct[`image_url${i}`];
      if (imageUrl) {
        images.push(imageUrl);
      }
    }

    return (
      <View style={styles.detailsContainer}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <FlatList
            data={images.length > 0 ? images : [PLACEHOLDER_IMAGE]}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.detailsImage} />
            )}
            style={styles.detailsImageGallery}
          />

          <View style={styles.detailsContent}>
            <Text style={styles.detailsName}>{selectedProduct.name}</Text>
            <Text style={styles.detailsPrice}>₹{selectedProduct.price}</Text>
            <Text style={styles.detailsBrand}>Brand: {selectedProduct.brand}</Text>
            <Text style={styles.detailsCategory}>Category: {selectedProduct.category}</Text>
            <Text style={styles.detailsDescription}>{selectedProduct.description}</Text>
          </View>
        </ScrollView>

        {/* Buy Now Button */}
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => handleBuyNowPress(selectedProduct.link)}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.statusText}>Error:</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (selectedProduct) {
    return renderProductDetails();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Online Store</Text>
      {products.length === 0 ? (
        <Text style={styles.noProductsText}>No products found.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          numColumns={2}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f4f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  productDetails: {
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c7c8b',
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
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c7c8b',
  },
  detailsImageGallery: {
    flexGrow: 0,
    marginBottom: 20,
  },
  detailsImage: {
    width: 400, // Adjust width to a common mobile screen size
    height: 400,
    resizeMode: 'contain',
  },
  detailsContent: {
    padding: 20,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  detailsPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4c7c8b',
    marginBottom: 10,
  },
  detailsBrand: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 5,
  },
  detailsCategory: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 10,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
  },
  buyButton: {
    backgroundColor: '#4c7c8b',
    paddingVertical: 15,
    borderRadius: 12,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
