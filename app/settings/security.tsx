import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Switch, Image, TextInput, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { Lock, QrCode, CheckCircle, XCircle } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

// Use the actual QR code component
const QRCodeDisplay = ({ value }: { value: string | null }) => (
   <View style={styles.qrCodeContainer}> 
       {value ? (
           <QRCode value={value} size={180} />
       ) : (
           <ActivityIndicator size="large" color="#6C63FF" />
       )}
   </View>
);

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { 
      listMfaFactors, 
      enrollMfaFactor, 
      challengeMfaFactor, 
      verifyMfaChallenge, 
      unenrollMfaFactor 
  } = useAuth();
  
  const [factors, setFactors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null); // Holds { id, totp: { qr_code } }
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const hasTotpFactor = factors.some(f => f.factor_type === 'totp' && f.status === 'verified');

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFactors = await listMfaFactors();
      setFactors(fetchedFactors);
    } catch (err: any) {
      setError(err.message || 'Failed to load MFA factors.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
      setIsEnrolling(true);
      setError(null);
      setEnrollmentData(null);
      setVerificationCode('');
      setVerifyError(null);
      try {
          const data = await enrollMfaFactor();
          setEnrollmentData(data);
      } catch (err: any) {
          setError(err.message || 'Failed to start enrollment.');
          setIsEnrolling(false);
      }
      // Keep isEnrolling true until verification or cancel
  };

  const handleVerifyEnrollment = async () => {
      if (!enrollmentData || !verificationCode) {
          setVerifyError('Please enter the code from your authenticator app.');
          return;
      }
      setIsVerifying(true);
      setVerifyError(null);
      try {
          // Challenge is implicitly created during enroll, use that ID
          const challengeData = await challengeMfaFactor(enrollmentData.id);
          await verifyMfaChallenge(enrollmentData.id, challengeData.id, verificationCode);
          Alert.alert('Success', 'Two-Factor Authentication has been enabled.');
          setEnrollmentData(null);
          setIsEnrolling(false);
          loadFactors(); // Refresh the factors list
      } catch (err: any) {
          setVerifyError(err.message || 'Verification failed. Code might be incorrect.');
      } finally {
          setIsVerifying(false);
      }
  };

  const handleUnenroll = async () => {
      const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (!totpFactor) return;

      Alert.alert('Disable 2FA', 'Are you sure you want to disable Two-Factor Authentication?', [
          { text: 'Cancel', style: 'cancel' },
          {
              text: 'Disable', style: 'destructive',
              onPress: async () => {
                  setIsLoading(true);
                  try {
                      await unenrollMfaFactor(totpFactor.id);
                      Alert.alert('Success', 'Two-Factor Authentication has been disabled.');
                      loadFactors();
                  } catch (err: any) {
                      Alert.alert('Error', err.message || 'Failed to disable 2FA.');
                      setIsLoading(false);
                  }
              }
          }
      ]);
  };
  
  const cancelEnrollment = () => {
      setIsEnrolling(false);
      setEnrollmentData(null);
      setError(null); // Clear enrollment error
      setVerifyError(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Security' }} />
      <View style={styles.contentContainer}>
        {isLoading ? (
           <ActivityIndicator />
        ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : isEnrolling ? (
            // Enrollment View
            <View style={styles.enrollmentContainer}>
                <Text style={styles.sectionTitle}>Enable Two-Factor Authentication</Text>
                <Text style={styles.instructions}>Scan the QR code below with your authenticator app (e.g., Google Authenticator, Authy).</Text>
                <QRCodeDisplay value={enrollmentData?.totp?.qr_code || null} />
                <Text style={styles.instructions}>Then, enter the 6-digit code generated by the app.</Text>
                <TextInput
                    style={styles.codeInput}
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholderTextColor="#A4B0BE"
                />
                {verifyError && <Text style={styles.errorText}>{verifyError}</Text>}
                <TouchableOpacity
                    style={[styles.button, styles.verifyButton, isVerifying && styles.buttonDisabled]}
                    onPress={handleVerifyEnrollment}
                    disabled={isVerifying}
                >
                    <Text style={styles.buttonText}>{isVerifying ? 'Verifying...' : 'Verify and Enable'}</Text>
                </TouchableOpacity>
                 <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={cancelEnrollment}
                >
                    <Text style={[styles.buttonText, { color: '#747D8C' }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        ) : (
            // Main Security View
            <View>
                 <View style={styles.settingItem}>
                   <View style={styles.settingTextContainer}> 
                       <Lock size={20} color="#2F3542" style={styles.icon} />
                       <Text style={styles.settingLabel}>Two-Factor Authentication (2FA)</Text>
                   </View>
                   <Switch
                       trackColor={{ false: "#E9ECEF", true: "#B5EABB" }} // Light green when true
                       thumbColor={hasTotpFactor ? "#4CAF50" : "#f4f3f4"} // Green when true
                       ios_backgroundColor="#E9ECEF"
                       onValueChange={hasTotpFactor ? handleUnenroll : handleEnroll}
                       value={hasTotpFactor}
                   />
                 </View>
                 {hasTotpFactor && (
                     <View style={styles.statusContainer}> 
                         <CheckCircle size={16} color="#4CAF50" />
                         <Text style={styles.statusText}>2FA is Enabled</Text>
                     </View>
                 )}
                 {!hasTotpFactor && (
                     <View style={styles.statusContainer}> 
                         <XCircle size={16} color="#A4B0BE" />
                         <Text style={[styles.statusText, {color: '#A4B0BE'}]}>2FA is Disabled</Text>
                     </View>
                 )}
                 {/* Add placeholder for Password Change */} 
                 <TouchableOpacity style={[styles.settingItem, { marginTop: 20 }]} onPress={() => Alert.alert('Password Change', 'Password change functionality not implemented yet.')}>
                   <View style={styles.settingTextContainer}> 
                       <Lock size={20} color="#2F3542" style={styles.icon} />
                       <Text style={styles.settingLabel}>Change Password</Text>
                   </View>
                 </TouchableOpacity>
             </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
   settingTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Allow text to take space
  },
  icon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2F3542',
  },
  statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginLeft: 16, // Indent status slightly
  },
  statusText: {
      marginLeft: 6,
      fontSize: 14,
      color: '#4CAF50',
  },
  enrollmentContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
      fontSize: 14,
      color: '#555',
      textAlign: 'center',
      marginBottom: 15,
  },
  qrCodeContainer: {
      width: 200,
      height: 200,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 20,
      padding: 10,
      borderWidth: 1,
      borderColor: '#E9ECEF',
  },
  codeInput: {
      borderWidth: 1,
      borderColor: '#CED4DA',
      padding: 12,
      borderRadius: 8,
      fontSize: 18,
      textAlign: 'center',
      width: '80%',
      marginBottom: 10,
      backgroundColor: '#F8F9FA',
  },
   button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  verifyButton: {
      backgroundColor: '#6C63FF',
  },
  cancelButton: {
      backgroundColor: '#E9ECEF',
  },
  buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
  buttonDisabled: {
      backgroundColor: '#A4B0BE',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
}); 