import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
       <Stack.Screen options={{ headerTitle: 'Notifications' }} />
       <View style={styles.centered}>
         <Text style={styles.placeholderText}>Notifications Coming Soon!</Text>
         {/* TODO: Implement notification list */}
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 18, color: '#A4B0BE', fontStyle: 'italic' },
}); 