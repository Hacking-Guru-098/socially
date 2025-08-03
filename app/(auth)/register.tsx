import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, UserRound, AtSign } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    displayName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      displayName?: string;
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // In a real app, this would call your auth API to register the user
      // For demo purposes, we'll simulate a success after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await signUp(formData.email, formData.password, {
        username: formData.username,
        display_name: formData.displayName,
      });
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please log in.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      setErrors({
        ...errors,
        general: error.message || 'Failed to create account. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear the error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
        general: undefined,
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <ArrowLeft size={24} color="#2F3542" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="dark" />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.formContainer}>
          {errors.general && (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <View style={[styles.inputWrapper, errors.displayName && styles.inputWrapperError]}>
              <UserRound size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                value={formData.displayName}
                onChangeText={(text) => handleInputChange('displayName', text)}
                editable={!loading}
              />
            </View>
            {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={[styles.inputWrapper, errors.username && styles.inputWrapperError]}>
              <AtSign size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                value={formData.username}
                onChangeText={(text) => handleInputChange('username', text.toLowerCase().replace(/\s+/g, ''))}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
              <Mail size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your email address"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
              <Lock size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#A4B0BE" />
                ) : (
                  <Eye size={20} color="#A4B0BE" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
              <Lock size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
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
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <View style={styles.passwordStrengthContainer}>
            <Text style={styles.passwordStrengthLabel}>Password Requirements:</Text>
            <View style={styles.passwordRequirements}>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    formData.password.length >= 8 && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    /(?=.*[A-Z])/.test(formData.password) && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 1 uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    /(?=.*[0-9])/.test(formData.password) && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 1 number</Text>
              </View>
              <View style={styles.requirementItem}>
                <View 
                  style={[
                    styles.requirementDot, 
                    /(?=.*[!@#$%^&*])/.test(formData.password) && styles.requirementMet
                  ]} 
                />
                <Text style={styles.requirementText}>At least 1 special character</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 8,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#2F3542',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A4B0BE',
  },
  formContainer: {
    padding: 24,
    paddingTop: 0,
  },
  generalErrorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  generalErrorText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#FF4081',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontWeight: '500',
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperError: {
    borderColor: '#FF4081',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#2F3542',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#FF4081',
    marginTop: 4,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginBottom: 24,
  },
  passwordStrengthLabel: {
    fontWeight: '500',
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
    fontSize: 14,
    color: '#2F3542',
  },
  registerButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#2F3542',
  },
  loginLink: {
    marginLeft: 4,
  },
  loginLinkText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#6C63FF',
  },
});