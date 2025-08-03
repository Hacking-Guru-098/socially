import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, ClipboardCopy, Check, RefreshCw } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider';

export default function Setup2FAScreen() {
  const { enableTwoFactor } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock QR code image for demonstration
  const qrCodeUri = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Socially:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Socially';

  // Generate a mock secret key on component mount
  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = () => {
    setLoading(true);
    
    // In a real app, this would be an API call to generate a secret
    // For demo purposes, we'll simulate a success after a delay
    setTimeout(() => {
      setSecret('JBSWY3DPEHPK3PXP');
      setLoading(false);
    }, 1000);
  };

  const copyToClipboard = async () => {
    try {
      // In a real app, we would use Clipboard.setStringAsync
      // For now, just show a success alert to simulate copying
      Alert.alert('Success', 'Secret key copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy secret key');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would verify the code with the server
      // For demo purposes, we'll simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enable 2FA in the auth context
      await enableTwoFactor();
      
      // Move to success step
      setStep(3);
    } catch (error: any) {
      setError(error.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Set Up Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Two-factor authentication adds an extra layer of security to your account.
        Follow these steps to set it up:
      </Text>

      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>
              Download an authenticator app
            </Text>
            <Text style={styles.instructionText}>
              If you don't already have one, download an authenticator app like Google Authenticator, 
              Authy, or Microsoft Authenticator from your device's app store.
            </Text>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>
              Scan the QR code or enter the key
            </Text>
            <Text style={styles.instructionText}>
              In the next step, you'll be shown a QR code to scan with your authenticator app. 
              Alternatively, you can manually enter the provided key.
            </Text>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>
              Enter the verification code
            </Text>
            <Text style={styles.instructionText}>
              Enter the 6-digit code shown in your authenticator app to verify the setup.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.subtitle}>
        Scan this QR code with your authenticator app or manually enter the secret key.
      </Text>

      <View style={styles.qrContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" />
        ) : (
          <Image 
            source={{ uri: qrCodeUri }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.secretKeyContainer}>
        <Text style={styles.secretKeyLabel}>Secret Key:</Text>
        <View style={styles.secretKeyRow}>
          <Text style={styles.secretKey}>{secret}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={copyToClipboard}
          >
            <ClipboardCopy size={20} color="#6C63FF" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.verificationInstructions}>
        Enter the 6-digit verification code from your authenticator app:
      </Text>

      <View style={styles.verificationInputContainer}>
        <TextInput
          style={[styles.verificationInput, error && styles.inputError]}
          placeholder="000000"
          value={verificationCode}
          onChangeText={(text) => {
            setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6));
            setError(null);
          }}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, loading && styles.buttonDisabled]}
          onPress={() => setStep(1)}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={generateSecret}
        disabled={loading}
      >
        <RefreshCw size={16} color="#6C63FF" />
        <Text style={styles.refreshButtonText}>Generate New Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.successContainer}>
      <Check size={80} color="#4CAF50" />
      <Text style={styles.successTitle}>Setup Complete!</Text>
      <Text style={styles.successText}>
        Two-factor authentication has been successfully enabled for your account.
        You'll be asked for a verification code when you sign in.
      </Text>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
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
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
  stepContainer: {
    flex: 1,
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
  instructionsContainer: {
    marginBottom: 32,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  instructionNumberText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2F3542',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#A4B0BE',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  continueButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 200,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  secretKeyContainer: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  secretKeyLabel: {
    fontWeight: '500',
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 8,
  },
  secretKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secretKey: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2F3542',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  verificationInstructions: {
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 16,
  },
  verificationInputContainer: {
    marginBottom: 24,
  },
  verificationInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 24,
    color: '#2F3542',
    textAlign: 'center',
    letterSpacing: 8,
  },
  inputError: {
    borderColor: '#FF4081',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4081',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  backButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2F3542',
  },
  verifyButton: {
    flex: 2,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  refreshButtonText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#6C63FF',
    marginLeft: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#2F3542',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#A4B0BE',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
}); 