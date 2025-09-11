import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/E0E0E0/333333?text=No+Image';

export default function XazeChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchedProducts, setSearchedProducts] = useState([]);
  const scrollViewRef = useRef(null);
  const { query } = useLocalSearchParams();
  const router = useRouter();

  // Scroll to the end of the chat
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // This useEffect handles the initial query from the home page
  useEffect(() => {
    if (query) {
      // Add the user's query as a message to the chat
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        text: query,
        user: { id: 1 },
      }]);
      // Run the search and Gemini call for the initial query
      handleSearchAndGemini(query);
    }
  }, [query]);

  const handleSearchAndGemini = async (searchQuery) => {
    setIsLoading(true);
    
    try {
      // Step 1: Search the product in Supabase
      // Removed .limit(1) to get all matching results
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${searchQuery}%`);

      if (error) {
        console.error("Supabase search error:", error);
        setSearchedProducts([]);
      } else {
        setSearchedProducts(data);
      }

      const promptText = data && data.length > 0 ?
        `I am looking for products like "${data[0].name}". Answer in very short with in a small few paragraph. Can you provide styling recommendations and pairing ideas for it?` :
        `Can you provide fashion advice and recommendations for "${searchQuery}"? Don't response to useless question except fashion related.`;

      // Step 2: Send the prompt to Gemini
      // NOTE: Your API key is hardcoded here. For a production app, consider using environment variables.
      const apiKey = "AIzaSyCA6DjyXomC-P_cRNvgaxYVeAFqBaZg5Hk";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      const geminiData = await geminiResponse.json();
      const aiReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn’t understand that. Please try again.";

      // Step 3: Add Gemini's reply to the chat
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        text: aiReply,
        user: { id: 2, name: 'Gemini' },
      }]);

    } catch (error) {
      console.error("Error in search or Gemini call:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          text: '⚠️ Network or API error, please try again.',
          user: { id: 2, name: 'Gemini' },
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
    setSearchedProducts([]); // Clear previous search results
    await handleSearchAndGemini(inputMessage);
    setInputMessage('');
  }, [inputMessage, handleSearchAndGemini]);
  
  // This function would be passed down from a parent component (like your app's layout)
  // to control the tab bar visibility based on the search results.
  const handleTabBarVisibility = (isVisible) => {
    // This is a placeholder. In a real Expo Router app, you would
    // use a context or a global state to control the layout.
    // e.g., using a global state manager or a context hook.
  };

  // Conditionally render based on whether search results are available
  const isSearchMode = searchedProducts.length > 0;

  useEffect(() => {
    // This effect handles the tab bar visibility.
    // In a real app, you would have a context hook here to update the state
    // of the parent layout.
    if (isSearchMode) {
      handleTabBarVisibility(false);
    } else {
      handleTabBarVisibility(true);
    }
  }, [isSearchMode]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{searchedProducts.length > 0 ? "Search Results" : (query || 'Chat with Gemini')}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="bell" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {isSearchMode ? (
        <ScrollView style={styles.searchResultsContainer}>
          <View style={styles.productGrid}>
            {searchedProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image
                  source={{ uri: product.image_url || PLACEHOLDER_IMAGE }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatMessagesContainer}
          contentContainerStyle={styles.chatMessagesContent}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.user.id === 1 ? styles.userMessageContainer : styles.geminiMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.user.id === 1 ? styles.userBubble : styles.geminiBubble,
                ]}
              >
                <Text style={styles.messageText}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.geminiMessageContainer}>
              <View style={[styles.messageBubble, styles.geminiBubble]}>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Input Container */}
      <View style={styles.inputContainer}>
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
    </KeyboardAvoidingView>
  );
};

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
  chatMessagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chatMessagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  geminiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    borderTopRightRadius: 5,
  },
  geminiBubble: {
    borderTopLeftRadius: 5,
  },
  messageText: {
    color: '#1F2937',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginHorizontal: 2,
  },
  dot1: {
    transform: [{ translateY: -2 }],
  },
  dot2: {
    transform: [{ translateY: 0 }],
  },
  dot3: {
    transform: [{ translateY: -2 }],
  },
  // Search Results Styles
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  productCard: {
    width: '48%', // A bit less than 50% to account for margin
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productDetails: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
    marginTop: 4,
  },
});
