import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../providers/AuthProvider';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.user_metadata?.display_name || 'Admin'}!
        </Text>
        <Text style={styles.description}>
          This is a protected admin area. Only users with admin role can access this screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2F3542',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    color: '#6C63FF',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#A4B0BE',
    maxWidth: 300,
  },
}); 