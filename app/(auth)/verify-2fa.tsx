import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Shield } from 'lucide-react-native';

export default function Verify2FAScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyTwoFactor } = useAuth();

  const handleVerification = async () => {
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await verifyTwoFactor(code);
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={48} color="#6C63FF" />
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Please enter the 6-digit code sent to your email
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
              setError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerification}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => {
            // TODO: Implement resend code functionality
            Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
          }}
          disabled={loading}
        >
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 48,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333333',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF4081',
  },
  errorText: {
    color: '#FF4081',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  button: {
    height: 48,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#6C63FF',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
}); 