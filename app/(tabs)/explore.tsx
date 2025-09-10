import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Gemini Chat',
      headerStyle: { backgroundColor: '#4F46E5' },
      headerTitleStyle: { color: 'white' },
      headerTintColor: 'white',
    });
  }, [navigation]);

  useEffect(() => {
    setMessages([
      {
        id: Math.random().toString(36).substring(7),
        text: "👋 Hi, I'm Gemini AI. Ask me anything!",
        user: { id: 2, name: 'Gemini' },
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const onSend = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Math.random().toString(36).substring(7),
      text: inputMessage,
      user: { id: 1 },
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    const apiKey = "AIzaSyCA6DjyXomC-P_cRNvgaxYVeAFqBaZg5Hk";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: inputMessage }] }],
        }),
      });

      const data = await response.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn’t understand.";

      const botMessage = {
        id: Math.random().toString(36).substring(7),
        text: aiReply,
        user: { id: 2, name: 'Gemini' },
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          text: '⚠️ Network error, please try again.',
          user: { id: 2, name: 'Gemini' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage]);

  const handleKeyPress = ({ nativeEvent: { key: pressedKey } }) => {
    if (pressedKey === 'Enter' && !isLoading) {
      onSend();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
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
              <Text style={msg.user.id === 1 ? styles.userText : styles.geminiText}>
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          editable={!isLoading}
          returnKeyType="send"
          onSubmitEditing={onSend} // Use onSubmitEditing for the "Send" key
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
    padding: 16,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
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
    borderRadius: 15,
  },
  userBubble: {
    backgroundColor: '#4F46E5',
    borderTopRightRadius: 2,
  },
  geminiBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userText: {
    color: 'white',
    fontSize: 14,
  },
  geminiText: {
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
});

export default App;