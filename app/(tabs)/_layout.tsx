import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

const TabBarBackground = () => (
  <View style={styles.tabBarBackground} />
);

const HapticTab = (props: any) => {
  const scale = useMemo(() => new Animated.Value(1), []);
  const handlePressIn = () => Animated.spring(scale, {
    toValue: 0.98, // Less aggressive scaling
    useNativeDriver: true,
    friction: 8, // Higher friction for faster return
    tension: 100, // Lower tension for quicker animation
  }).start();
  const handlePressOut = () => Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: true,
    friction: 8,
    tension: 100,
  }).start();

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabButton}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {props.children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#131616ff', // Active color (dark teal)
        tabBarInactiveTintColor: '#A9A9A9', // Inactive color (dark gray)
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: '#FFFFFF' }, // Solid white background
          Platform.select({
            ios: { position: 'absolute' },
            android: {},
          }),
        ],
        tabBarLabelStyle: styles.label, // Style for text labels
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={20} // Reduced size for faster rendering
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="xaze"
        options={{
          title: 'Xaze',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'star' : 'star-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tryon"
        options={{
          title: 'Try-On',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'hanger' : 'hanger'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70, // Maintain height for labels
    borderTopWidth: 1, // Subtle border for rectangular look
    borderTopColor: '#E0E0E0', // Light gray border
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    paddingBottom: 5,
    paddingHorizontal: 25,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF', // Solid white background
  },
  blurEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.95,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
});