import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider';

// Placeholder Google icon - replace with a proper asset or icon library
const GoogleIcon = () => (
    <Image 
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' }} 
        style={{ width: 20, height: 20 }} 
    />
);

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    // Simple email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== 'admin') {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // For demo purposes, hardcode test credentials
      // In a real app, this would call your auth API
      if ((email === 'user@example.com' && password === 'password123') ||
          (email === 'admin' && password === 'admin') ||
          (email === 'demo@socially.com' && password === 'Demo123!')) {
        // Simulate some network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await signIn(email, password);
        console.log("Login successful, manually redirecting to tabs");
        router.replace('/(tabs)');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      setErrors({
        ...errors,
        general: error.message || 'Failed to sign in. Please check your credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would initiate OAuth flow
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login for demo
      await signIn('user@example.com', 'password123');
      console.log("Social login successful, manually redirecting to tabs");
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Error',
        `Failed to sign in with ${provider}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
        await signInWithGoogle();
        // On mobile, deep linking handles the redirect.
        // The AuthProvider's onAuthStateChange listener will update the state and RootLayout will redirect.
        // No explicit router.replace needed here unless the deep link fails.
        // console.log('Google sign-in initiated...')
    } catch (error: any) {
        Alert.alert('Google Sign-In Error', error.message || 'Failed to sign in with Google.');
    } finally {
        setGoogleLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerBackVisible: false,
        }}
      />
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Default Credentials Info */}
          <View style={styles.defaultCredentialsContainer}>
            <Text style={styles.defaultCredentialsTitle}>Default Login Credentials:</Text>
            <Text style={styles.defaultCredentialsText}>Email: demo@socially.com</Text>
            <Text style={styles.defaultCredentialsText}>Password: Demo123!</Text>
            <Text style={styles.defaultCredentialsText}>Admin: admin / admin</Text>
          </View>

          {errors.general && (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
              <Mail size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({...errors, email: undefined, general: undefined});
                  }
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
              <Lock size={20} color="#A4B0BE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({...errors, password: undefined, general: undefined});
                  }
                }}
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

          <Link href="/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton, googleLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#757575" />
              ) : (
                <>
                   <GoogleIcon />
                   <Text style={[styles.socialButtonText, styles.googleButtonText]}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={() => handleSocialLogin('Apple')}
              disabled={loading}
            >
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/register" asChild>
            <TouchableOpacity disabled={loading || googleLoading}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#747D8C',
  },
  formContainer: {
    marginBottom: 30,
  },
  defaultCredentialsContainer: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  defaultCredentialsTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0D47A1',
    marginBottom: 5,
  },
  defaultCredentialsText: {
    fontSize: 12,
    color: '#1565C0',
    marginBottom: 2,
  },
  generalErrorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  generalErrorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
  },
  inputWrapperError: {
    borderColor: '#F44336',
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
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  orText: {
    marginHorizontal: 10,
    color: '#A4B0BE',
    fontSize: 14,
  },
  socialButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  googleButton: {
    // Specific styles for Google button if needed
  },
  appleButton: {
    backgroundColor: '#2F3542',
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  googleButtonText: {
    color: '#757575', // Standard Google button text color
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#747D8C',
    fontSize: 14,
    marginRight: 5,
  },
  signUpLink: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});