import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Supabase setup - Note: For production, use environment variables for keys.
const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";
const supabase = createClient(supabaseUrl, supabaseKey);

// Reusable Chip Component for multiple-choice selections
const Chip = ({ label, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      isSelected ? styles.activeChip : styles.inactiveChip,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.chipText,
        isSelected ? styles.activeChipText : styles.inactiveChipText,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    occupation: '',
    bodyShape: '',
    bodySize: '',
    skinTone: '',
    marketplace: '',
    styles: '',
  });

  const handleSignup = async () => {
    // Check all fields are filled
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.age ||
      !formData.gender ||
      !formData.occupation ||
      !formData.bodyShape ||
      !formData.bodySize ||
      !formData.skinTone ||
      !formData.marketplace ||
      !formData.styles
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Attempt to sign up with Supabase
    const { data, error } = await signUp(formData.email, formData.password);
    if (error) {
      Alert.alert('Signup failed', error.message);
      return;
    }

    // Insert user profile data
    const { error: profileError } = await supabase.from('user_profiles').insert({
      email: formData.email,
      age: formData.age,
      gender: formData.gender,
      occupation: formData.occupation,
      body_shape: formData.bodyShape,
      body_size: formData.bodySize,
      skin_tone: formData.skinTone,
      preferred_marketplace: formData.marketplace,
      preferred_styles: formData.styles,
    });

    if (profileError) {
      Alert.alert('Profile save failed', profileError.message);
      return;
    }

    // Success and navigate
    Alert.alert('Success', 'Account created and profile saved! Logging you in...');
    router.replace('/(tabs)');
  };

  const handleChipPress = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Fill out your details to get started.
        </Text>

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        {/* Confirm Password Input */}
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        {/* Age Section */}
        <Text style={styles.label}>Age</Text>
        <View style={styles.chipContainer}>
          {['<18', '18-25', '26-35', '45+'].map((age) => (
            <Chip
              key={age}
              label={age}
              isSelected={formData.age === age}
              onPress={() => handleChipPress('age', age)}
            />
          ))}
        </View>

        {/* Gender Section */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chipContainer}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <Chip
              key={gender}
              label={gender}
              isSelected={formData.gender === gender}
              onPress={() => handleChipPress('gender', gender)}
            />
          ))}
        </View>

        {/* Occupation Section */}
        <Text style={styles.label}>What do you do?</Text>
        <View style={styles.chipContainer}>
          {['College Student', 'Working Professional', 'School Student', 'Others'].map(
            (occupation) => (
              <Chip
                key={occupation}
                label={occupation}
                isSelected={formData.occupation === occupation}
                onPress={() => handleChipPress('occupation', occupation)}
              />
            )
          )}
        </View>

        {/* Body Shape Section */}
        <Text style={styles.label}>Body Shape</Text>
        <View style={styles.chipContainer}>
          {['Hourglass', 'Apple', 'Pear', 'Rectangle'].map(
            (bodyShape) => (
              <Chip
                key={bodyShape}
                label={bodyShape}
                isSelected={formData.bodyShape === bodyShape}
                onPress={() => handleChipPress('bodyShape', bodyShape)}
              />
            )
          )}
        </View>

        {/* Body Size Section */}
        <Text style={styles.label}>Body Size</Text>
        <View style={styles.chipContainer}>
          {['Small', 'Medium', 'Large'].map((bodySize) => (
            <Chip
              key={bodySize}
              label={bodySize}
              isSelected={formData.bodySize === bodySize}
              onPress={() => handleChipPress('bodySize', bodySize)}
            />
          ))}
        </View>

        {/* Skin Tone Section */}
        <Text style={styles.label}>Skin Tone</Text>
        <View style={styles.chipContainer}>
          {['Fair', 'Medium', 'Dark'].map((skinTone) => (
            <Chip
              key={skinTone}
              label={skinTone}
              isSelected={formData.skinTone === skinTone}
              onPress={() => handleChipPress('skinTone', skinTone)}
            />
          ))}
        </View>

        {/* Marketplace Section */}
        <Text style={styles.label}>Preferred Marketplace</Text>
        <View style={styles.chipContainer}>
          {['Amazon', 'Flipkart', 'Mesho', 'Myntra', 'Ajio', 'The Soul Store'].map(
            (marketplace) => (
              <Chip
                key={marketplace}
                label={marketplace}
                isSelected={formData.marketplace === marketplace}
                onPress={() => handleChipPress('marketplace', marketplace)}
              />
            )
          )}
        </View>

        {/* Styles Section */}
        <Text style={styles.label}>Preferred Styles</Text>
        <View style={styles.chipContainer}>
          {['Formal', 'Casual', 'Ethnic'].map((styles) => (
            <Chip
              key={styles}
              label={styles}
              isSelected={formData.styles === styles}
              onPress={() => handleChipPress('styles', styles)}
            />
          ))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.secondaryButtonText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollViewContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inactiveChip: {
    backgroundColor: '#f3f4f6',
  },
  activeChip: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveChipText: {
    color: '#4b5563',
  },
  activeChipText: {
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 24,
  },
  button: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
});