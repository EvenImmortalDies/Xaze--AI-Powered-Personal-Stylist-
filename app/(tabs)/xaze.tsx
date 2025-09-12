import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/E0E0E0/333333?text=No+Image';

export default function XazeChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const scrollViewRef = useRef(null);
  const { query } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (query) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        text: query,
        user: { id: 1 },
      }]);
      handleSearchAndGemini(query);
    }
  }, [query]);

  const handleSearchAndGemini = async (searchQuery) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase search error:", error);
        setSearchedProducts([]);
      } else {
        setSearchedProducts(data || []);
      }

      const promptText = data && data.length > 0
        ? `I am looking for products like "${data[0].name}". Answer in a concise paragraph with styling recommendations and pairing ideas.`
        : `Provide fashion advice and recommendations for "${searchQuery}". Respond only to fashion-related queries.`;

      const apiKey = "AIzaSyCA6DjyXomC-P_cRNvgaxYVeAFqBaZg5Hk";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const aiReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't understand that. Please try again.";

      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        text: aiReply,
        user: { id: 2, name: 'Alle' },
      }]);

    } catch (error) {
      console.error("Error in search or Gemini call:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          text: '⚠️ Network or API error, please try again.',
          user: { id: 2, name: 'Alle' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSend = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Math.random().toString(36).substring(7),
      text: inputMessage,
      user: { id: 1 },
    };

    setMessages(prev => [...prev, newUserMessage]);
    setSearchedProducts([]);
    setSelectedProduct(null);
    await handleSearchAndGemini(inputMessage);
    setInputMessage('');
  }, [inputMessage, handleSearchAndGemini]);

  const toggleChatMinimize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToGrid = () => {
    setSelectedProduct(null);
  };

  const handleBuyNowPress = (productLink) => {
    if (productLink) {
      Linking.openURL(productLink).catch(err => {
        console.error("Failed to open URL:", err);
      });
    }
  };

  const isSearchMode = searchedProducts.length > 0 && !selectedProduct;

  useEffect(() => {
    router.setParams({ hideTabBar: isSearchMode || !!selectedProduct });
  }, [isSearchMode, selectedProduct, router]);

  // Render product grid item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)} style={styles.productCard}>
      <Image
        source={{ uri: item.image_url1 || PLACEHOLDER_IMAGE }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.productRating}>
          <AntDesign name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render product details
  const renderProductDetails = () => {
    if (!selectedProduct) return null;

    // Collect all available image URLs
    const images = [];
    for (let i = 1; i <= 6; i++) {
      const imageUrl = selectedProduct[`image_url${i}`];
      if (imageUrl && imageUrl.trim() !== '') {
        images.push(imageUrl);
      }
    }

    const imageWidth = screenWidth;
    const imageHeight = imageWidth * 0.8;

    return (
      <View style={styles.detailsContainer}>
        <TouchableOpacity onPress={handleBackToGrid} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.detailsScrollView}
          contentContainerStyle={{
            paddingBottom: isChatMinimized ? 100 : 250,
          }}
          showsVerticalScrollIndicator={false}
        >
          {images.length > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(item, index) => `img-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={[styles.detailsImage, { width: imageWidth, height: imageHeight }]} resizeMode="contain" />
              )}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              getItemLayout={(data, index) => ({
                length: imageWidth,
                offset: imageWidth * index,
                index,
              })}
            />
          ) : (
            <Image source={{ uri: PLACEHOLDER_IMAGE }} style={styles.detailsImage} resizeMode="contain" />
          )}

          <View style={styles.detailsContent}>
            <Text style={styles.detailsName}>{selectedProduct.name}</Text>
            <Text style={styles.detailsPrice}>${selectedProduct.price}</Text>
            <View style={styles.detailsRating}>
              <AntDesign name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>4.5 (120 reviews)</Text>
            </View>
            {selectedProduct.brand && <Text style={styles.detailsInfo}>Brand: {selectedProduct.brand}</Text>}
            {selectedProduct.category && <Text style={styles.detailsInfo}>Category: {selectedProduct.category}</Text>}
            {selectedProduct.color && <Text style={styles.detailsInfo}>Color: {selectedProduct.color}</Text>}
            {selectedProduct.gender_target && <Text style={styles.detailsInfo}>Target: {selectedProduct.gender_target}</Text>}
            {selectedProduct.style && <Text style={styles.detailsInfo}>Style: {selectedProduct.style}</Text>}
            {selectedProduct.description && <Text style={styles.detailsDescription}>{selectedProduct.description}</Text>}
          </View>
        </ScrollView>

        {selectedProduct.link && (
          <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyNowPress(selectedProduct.link)}>
            <Text style={styles.buyButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedProduct ? selectedProduct.name : (isSearchMode ? "Xaze" : (query || 'Chat with Xaze'))}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="bell" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {selectedProduct ? (
          renderProductDetails()
        ) : isSearchMode ? (
          <FlatList
            data={searchedProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProductItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        ) : (
          <View style={styles.emptyChatBackground} />
        )}
      </View>

      {!isChatMinimized ? (
        <View style={styles.chatPopup}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Chat with Xaze</Text>
            <TouchableOpacity onPress={toggleChatMinimize} style={styles.closeButton}>
              <AntDesign name="minus" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  msg.user.id === 1 ? styles.userMessage : styles.alleMessage,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.alleMessage}>
                <Text style={styles.loadingText}>Typing...</Text>
              </View>
            )}
          </ScrollView>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Ask follow up..."
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            <TouchableOpacity
              onPress={onSend}
              disabled={isLoading || !inputMessage.trim()}
              style={[styles.sendButton, (isLoading || !inputMessage.trim()) && styles.disabledButton]}
            >
              <AntDesign name="arrowup" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.chatMinimized} onPress={toggleChatMinimize}>
          <Text style={styles.minimizedText}>Chat with Xaze</Text>
          <AntDesign name="plus" size={20} color="#333" />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  emptyChatBackground: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  productCard: {
    width: '48%',
    margin: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  productDetails: {
    alignItems: 'center',
    padding: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B4B51',
    marginBottom: 5,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 5,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  detailsScrollView: {
    flex: 1,
    marginTop: 60,
  },
  detailsImageGallery: {
    height: 400,
  },
  detailsImage: {
    height: 400,
  },
  detailsContent: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailsName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  detailsPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 15,
  },
  detailsRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailsInfo: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginTop: 10,
  },
  buyButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  chatPopup: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    maxHeight: '70%',
    zIndex: 1000,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
    padding: 12,
  },
  chatContent: {
    paddingBottom: 12,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E0E7FF',
  },
  alleMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  chatMinimized: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1000,
  },
  minimizedText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});