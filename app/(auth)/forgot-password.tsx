import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router, Link } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call your API to send a password reset email
      // For demo purposes, we'll simulate a success after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderResetForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Mail size={20} color="#A4B0BE" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.resetButton, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.resetButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.backToLoginLink}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  const renderSuccessState = () => (
    <View style={styles.successContainer}>
      <CheckCircle size={64} color="#4CAF50" />
      <Text style={styles.successTitle}>Email Sent!</Text>
      <Text style={styles.successMessage}>
        We've sent password reset instructions to:
      </Text>
      <Text style={styles.emailText}>{email}</Text>
      <Text style={styles.instructionsText}>
        Please check your email and follow the instructions to reset your password. 
        The link will expire in 30 minutes.
      </Text>

      <TouchableOpacity 
        style={styles.resendButton}
        onPress={handleResetPassword}
      >
        <Text style={styles.resendButtonText}>Resend Email</Text>
      </TouchableOpacity>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.backToLoginButton}>
          <Text style={styles.backToLoginButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

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

      <View style={styles.container}>
        {success ? renderSuccessState() : renderResetForm()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  headerBackButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#2F3542',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#A4B0BE',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#2F3542',
  },
  inputError: {
    borderColor: '#FF4081',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4081',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  backToLoginLink: {
    alignItems: 'center',
    padding: 16,
  },
  backToLoginText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#6C63FF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#2F3542',
    marginTop: 24,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#2F3542',
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#6C63FF',
    marginVertical: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#A4B0BE',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  resendButton: {
    padding: 16,
    marginBottom: 8,
  },
  resendButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#6C63FF',
  },
  backToLoginButton: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backToLoginButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2F3542',
  },
}); 