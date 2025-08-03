import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { X, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { StatusBar } from 'expo-status-bar';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  // In a real app, you would have a changePassword function in your auth context
  // For now, we'll simulate it
  const changePassword = async (current: string, newPass: string) => {
    // Simulate API call delay
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would call your auth API
        // For demo purposes, let's pretend the password must be "password123"
        if (current === 'password123') {
          resolve();
        } else {
          reject(new Error('Current password is incorrect'));
        }
      }, 1500);
    });
  };

  const validateForm = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character (!@#$%^&*)';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      Alert.alert(
        'Success',
        'Your password has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
      setErrors({ 
        ...errors, 
        currentPassword: 'Current password is incorrect' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Change Password',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <X size={24} color="#2F3542" />
            </TouchableOpacity>
          ),
        }} 
      />
      <StatusBar style="dark" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Lock size={48} color="#6C63FF" />
          <Text style={styles.title}>Update Your Password</Text>
          <Text style={styles.subtitle}>
            Create a strong password with a mix of letters, numbers, and symbols
          </Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[styles.input, errors.currentPassword && styles.inputError]}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (errors.currentPassword) {
                    setErrors({ ...errors, currentPassword: undefined });
                  }
                }}
                placeholder="Enter current password"
                secureTextEntry={!showCurrentPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color="#A4B0BE" />
                ) : (
                  <Eye size={20} color="#A4B0BE" />
                )}
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[styles.input, errors.newPassword && styles.inputError]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: undefined });
                  }
                }}
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#A4B0BE" />
                ) : (
                  <Eye size={20} color="#A4B0BE" />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#A4B0BE" />
                ) : (
                  <Eye size={20} color="#A4B0BE" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
          
          <View style={styles.passwordStrengthContainer}>
            <Text style={styles.passwordStrengthLabel}>Password must contain:</Text>
            <View style={styles.passwordRequirements}>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    newPassword.length >= 8 && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    /(?=.*[A-Z])/.test(newPassword) && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 1 uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    /(?=.*[0-9])/.test(newPassword) && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 1 number</Text>
              </View>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    /(?=.*[!@#$%^&*])/.test(newPassword) && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 1 special character</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#2F3542',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#A4B0BE',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#2F3542',
  },
  inputError: {
    borderColor: '#FF4081',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#FF4081',
    marginTop: 4,
  },
  passwordStrengthContainer: {
    marginBottom: 24,
  },
  passwordStrengthLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 12,
  },
  passwordRequirements: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A4B0BE',
    marginRight: 8,
  },
  requirementMet: {
    backgroundColor: '#4CAF50',
  },
  requirementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#2F3542',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
}); 