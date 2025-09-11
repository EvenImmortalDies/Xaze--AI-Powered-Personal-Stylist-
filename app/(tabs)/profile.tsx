// app/(tabs)/profile.tsx
import React from 'react';
import { Button, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Profile</Text>
      <Text>Email: {user?.email}</Text>
      <Button title="Logout" onPress={() => signOut()} />
    </View>
  );
}
