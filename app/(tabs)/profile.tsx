import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Supabase setup
const supabaseUrl = "Supabase URL";
const supabaseAnonKey = "Anon KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Chip component for displaying marketplace preferences 
const Chip = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

export default function Profile() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    } else if (user) {
      const fetchProfile = async () => {
        try {
          setProfileLoading(true);
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', user.email)
            .single();
          if (error) throw error;
          setProfile(data);
        } catch (err) {
          setError('Failed to load profile data');
          console.error('Error fetching profile:', err);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    }
  }, [authLoading, user]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (authLoading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
      </View>
    );
  }

  const username = profile.email.split('@')[0];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.profileIcon}>
          <Text style={styles.iconText}>{username.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.title}>{username}</Text>
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{profile.age}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{profile.gender}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Occupation:</Text>
            <Text style={styles.value}>{profile.occupation}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Body Shape:</Text>
            <Text style={styles.value}>{profile.body_shape}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Body Size:</Text>
            <Text style={styles.value}>{profile.body_size}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Skin Tone:</Text>
            <Text style={styles.value}>{profile.skin_tone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Preferred Marketplace:</Text>
            <View style={styles.chipContainer}>
              {Array.isArray(profile.preferred_marketplace) ? (
                profile.preferred_marketplace.map((marketplace) => (
                  <Chip key={marketplace} label={marketplace} />
                ))
              ) : (
                <Text style={styles.value}>{profile.preferred_marketplace}</Text>
              )}
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Preferred Styles:</Text>
            <Text style={styles.value}>{profile.preferred_styles}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: 40,
    marginTop: 30, // Increased top margin from 40 to 60
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  details: {
    width: '100%',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18, // Increased line spacing from 12 to 18
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#4b5563',
    flex: 2,
    textAlign: 'right',
  },
  chipContainer: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipText: {
    fontSize: 14,
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: 'rgba(243, 244, 246, 0.7)', // Grey transparent background
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
  },
});
