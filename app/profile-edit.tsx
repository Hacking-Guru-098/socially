import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { Save, User, Edit3 } from 'lucide-react-native';

export default function ProfileEditScreen() {
  const { user, updateUserMetadata } = useAuth();
  const router = useRouter();
  
  // Initialize state with current user data or empty strings
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveChanges = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Update user metadata
      await updateUserMetadata({ display_name: displayName, bio: bio });
      
      // Navigate back and show success message
      Alert.alert('Success', 'Profile updated successfully.');
      router.back(); 

    } catch (err: any) {
      console.error("Error updating profile:", err);
      const message = err.message || 'Failed to update profile.';
      setError(message);
      Alert.alert('Error', message); // Show error alert as well
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Edit Profile',
          headerTitleStyle: styles.headerTitle,
          headerBackTitle: 'Profile', // Sets text for back button on iOS
        }}
      />
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Name</Text>
          <View style={styles.inputContainer}>
            <User size={18} color="#A4B0BE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              placeholderTextColor="#A4B0BE"
              autoCapitalize="words"
            />
          </View> 
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Edit3 size={18} color="#A4B0BE" style={[styles.inputIcon, styles.textAreaIcon]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor="#A4B0BE"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          <Save size={18} color="#FFFFFF" style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2F3542',
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#747D8C',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2F3542',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  textAreaIcon: {
    marginTop: 4, // Align icon better with multiline input
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#A4B0BE',
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  }
});