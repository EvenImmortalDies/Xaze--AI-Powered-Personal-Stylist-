import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Supabase setup - Note: For production, use environment variables for keys.
const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";
const supabase = createClient(supabaseUrl, supabaseKey);

// Reusable Chip Component for single-select
const Chip = ({ label, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, isSelected ? styles.activeChip : styles.inactiveChip]}
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
  const [currentStep, setCurrentStep] = useState(1);
  const [skinToneValue, setSkinToneValue] = useState(0); // 0: Fair, 1: Medium, 2: Dark

  const skinTones = ['Fair', 'Medium', 'Dark'];
  const skinColors = ['#FFDAB9', '#D2B48C', '#8B4513']; // Approximate skin tone colors

  const handleChipPress = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return (
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword
      );
    } else if (currentStep === 2) {
      return formData.age && formData.gender && formData.occupation;
    } else if (currentStep === 3) {
      return formData.bodyShape && formData.bodySize && formData.skinTone;
    } else if (currentStep === 4) {
      return formData.marketplace && formData.styles;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 3) {
        setFormData({ ...formData, skinTone: skinTones[skinToneValue] });
      }
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(
        'Error',
        currentStep === 1
          ? 'Please fill all fields and ensure passwords match'
          : 'Please select all options'
      );
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSignup = async () => {
    if (!validateStep()) {
      Alert.alert('Error', 'Please select all options');
      return;
    }

    const { data, error } = await signUp(formData.email, formData.password);
    if (error) {
      Alert.alert('Signup failed', error.message);
      return;
    }

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

    Alert.alert('Success', 'Account created and profile saved! Logging you in...');
    router.replace('/(tabs)');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Account Details</Text>
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
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>Personal Info</Text>
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
          </>
        );
        case 3:
          const maleBodyShapes = ['Rectangle', 'Inverted Triangle', 'Oval', 'Trapezoid'];
          const femaleBodyShapes = ['Hourglass', 'Apple', 'Pear', 'Rectangle'];
          const bodyShapes = formData.gender === 'Male' ? maleBodyShapes : femaleBodyShapes;
        
          return (
            <>
              <Text style={styles.title}>Body Details</Text>
        
              <Text style={styles.label}>Body Shape</Text>
              <View style={styles.chipContainer}>
                {bodyShapes.map((bodyShape) => (
                  <Chip
                    key={bodyShape}
                    label={bodyShape}
                    isSelected={formData.bodyShape === bodyShape}
                    onPress={() => handleChipPress('bodyShape', bodyShape)}
                  />
                ))}
              </View>
        
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
        
              <Text style={styles.label}>Skin Tone</Text>
              <View style={styles.chipContainer}>
                {['Very Fair', 'Fair', 'Medium', 'Tan', 'Dark'].map((tone) => (
                  <Chip
                    key={tone}
                    label={tone}
                    isSelected={formData.skinTone === tone}
                    onPress={() => handleChipPress('skinTone', tone)}
                  />
                ))}
              </View>
            </>
          );
        
      case 4:
        return (
          <>
            <Text style={styles.title}>Preferences</Text>
            <Text style={styles.label}>Preferred Marketplace</Text>
            <View style={styles.chipContainer}>
              {['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'Ajio', 'The Soul Store'].map(
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.progress}>Step {currentStep} of 4</Text>
        {renderStep()}
      </ScrollView>
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.spacer} />
        {currentStep < 4 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleSignup}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>
        )}
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
    flexGrow: 1,
  },
  progress: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  sliderContainer: {
    marginTop: 16,
  },
  slider: {
    height: 40,
  },
  skinSwatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  skinToneLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 12,
  },
  skinSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(243, 244, 246, 0.7)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
});