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
  View,
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
  const [isChatMinimized, setIsChatMinimized] = useState(false);
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
        .ilike('name', `%${searchQuery}%`);

      if (error) {
        console.error("Supabase search error:", error);
        setSearchedProducts([]);
      } else {
        setSearchedProducts(data);
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
    await handleSearchAndGemini(inputMessage);
    setInputMessage('');
  }, [inputMessage, handleSearchAndGemini]);

  const toggleChatMinimize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  const isSearchMode = searchedProducts.length > 0;

  useEffect(() => {
    router.setParams({ hideTabBar: isSearchMode });
  }, [isSearchMode, router]);

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
        <Text style={styles.headerTitle}>{isSearchMode ? "Xaze" : (query || 'Chat with Xaze')}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="bell" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area - Search Results behind */}
      <View style={styles.mainContent}>
        {isSearchMode ? (
          <ScrollView style={styles.searchResultsContainer} contentContainerStyle={{ paddingBottom: 200 }}>
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
          <View style={styles.emptyChatBackground} />
        )}
      </View>

      {/* Chatbot Popup - Minimizable */}
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
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#6B7280',
    marginTop: 4,
  },
  chatPopup: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    padding: 12,
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
    padding: 10,
    borderRadius: 12,
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
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    padding: 10,
    backgroundColor: 'white',
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