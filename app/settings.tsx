import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Linking, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Lock, ShieldCheck, UserRound, Mail, LogOut, X, Eye, EyeOff, Bell, FileText, Info } from 'lucide-react-native';
import { Link as LinkIcon } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { StatusBar } from 'expo-status-bar';

// Helper component for Settings Row
interface SettingsRowProps {
  icon: React.ElementType;
  iconColor?: string;
  label: string;
  value?: string | null;
  onPress?: () => void;
  showChevron?: boolean;
  children?: React.ReactNode; // For embedding Switches etc.
}

const SettingsRow: React.FC<SettingsRowProps> = ({ 
  icon: Icon, 
  iconColor = '#6C63FF', 
  label, 
  value, 
  onPress, 
  showChevron = true, 
  children 
}) => {
  const content = (
    <View style={styles.settingItemContainer}>
      <View style={styles.settingIcon}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {children}
      {showChevron && !children && <ChevronRight size={20} color="#A4B0BE" />}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  ) : (
    content
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, twoFactorEnabled, enableTwoFactor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    email: user?.email || '',
    username: user?.user_metadata?.username || '',
  });
  
  // Get connected social accounts
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: false,
    facebook: false,
    apple: false,
    twitter: false,
  });

  // Simulate fetching connected accounts
  useEffect(() => {
    // This would be an API call in a real app
    const timer = setTimeout(() => {
      setConnectedAccounts({
        google: true,
        facebook: false,
        apple: true,
        twitter: false,
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleToggle2FA = async () => {
    try {
      setSecurityLoading(true);
      if (!twoFactorEnabled) {
        // Instead of directly enabling 2FA, navigate to the setup screen
        router.push('/setup-2fa');
      } else {
        Alert.alert(
          'Disable 2FA',
          'Are you sure you want to disable two-factor authentication? This will reduce the security of your account.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                // This would call an API to disable 2FA in a real app
                Alert.alert('Success', 'Two-factor authentication has been disabled.');
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update two-factor authentication settings.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToChangePassword = () => {
    router.push('/change-password');
  };

  const navigateToProfileEdit = () => {
    router.push('/profile-edit');
  };

  const promptDisconnectAccount = (platform) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${platform} account?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            // This would call an API to disconnect the account in a real app
            const updated = { ...connectedAccounts };
            updated[platform.toLowerCase()] = false;
            setConnectedAccounts(updated);
            Alert.alert('Success', `Your ${platform} account has been disconnected.`);
          },
        },
      ]
    );
  };

  const promptConnectAccount = (platform) => {
    Alert.alert(
      'Connect Account',
      `Would you like to connect your ${platform} account?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: () => {
            // This would call an API to connect the account in a real app
            const updated = { ...connectedAccounts };
            updated[platform.toLowerCase()] = true;
            setConnectedAccounts(updated);
            Alert.alert('Success', `Your ${platform} account has been connected.`);
          },
        },
      ]
    );
  };

  const handleAccountAction = (platform: string, isConnected: boolean) => {
    const action = isConnected ? 'Disconnect' : 'Connect';
    Alert.alert(
      `${action} Account`,
      `Are you sure you want to ${action.toLowerCase()} your ${platform} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: isConnected ? 'destructive' : 'default',
          onPress: async () => {
            // TODO: Call actual connect/disconnect API
            await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
            const updated = { ...connectedAccounts };
            updated[platform.toLowerCase()] = !isConnected;
            setConnectedAccounts(updated);
            Alert.alert('Success', `Account ${action.toLowerCase()}ed (Mock).`);
          },
        },
      ]
    );
  };

  // Function to open external links
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert('Error', 'Could not open link.'));
  }

  const settingsOptions = [
    { title: 'Account', icon: UserRound, route: '/settings/account' },
    { title: 'Security', icon: Lock, route: '/settings/security' }, // Will add 2FA here
    { title: 'Notifications', icon: Bell, route: '/settings/notifications' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Settings' }} />
      <StatusBar style="dark" />
      
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <UserRound size={20} color="#6C63FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Username</Text>
              <Text style={styles.settingValue}>{userProfile.username}</Text>
            </View>
            <TouchableOpacity onPress={navigateToProfileEdit}>
              <ChevronRight size={20} color="#A4B0BE" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Mail size={20} color="#6C63FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{userProfile.email}</Text>
            </View>
            <TouchableOpacity onPress={navigateToProfileEdit}>
              <ChevronRight size={20} color="#A4B0BE" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={navigateToChangePassword}
          >
            <View style={styles.settingIcon}>
              <Lock size={20} color="#6C63FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <ChevronRight size={20} color="#A4B0BE" />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <ShieldCheck size={20} color="#6C63FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>
                {twoFactorEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Add an extra layer of security'}
              </Text>
            </View>
            {securityLoading ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: '#E1E1E1', true: '#D1CFE9' }}
                thumbColor={twoFactorEnabled ? '#6C63FF' : '#FFFFFF'}
              />
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => connectedAccounts.google 
              ? promptDisconnectAccount('Google') 
              : promptConnectAccount('Google')}
          >
            <View style={styles.settingIcon}>
              <Mail size={20} color="#DB4437" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Google</Text>
              <Text style={styles.settingDescription}>
                {connectedAccounts.google ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <ChevronRight size={20} color="#A4B0BE" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => connectedAccounts.facebook 
              ? promptDisconnectAccount('Facebook') 
              : promptConnectAccount('Facebook')}
          >
            <View style={styles.settingIcon}>
              <UserRound size={20} color="#4267B2" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Facebook</Text>
              <Text style={styles.settingDescription}>
                {connectedAccounts.facebook ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <ChevronRight size={20} color="#A4B0BE" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => connectedAccounts.apple 
              ? promptDisconnectAccount('Apple') 
              : promptConnectAccount('Apple')}
          >
            <View style={styles.settingIcon}>
              <Lock size={20} color="#000000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Apple</Text>
              <Text style={styles.settingDescription}>
                {connectedAccounts.apple ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <ChevronRight size={20} color="#A4B0BE" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <LogOut size={20} color="#FFFFFF" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>Socially v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#2F3542',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#2F3542',
    marginBottom: 2,
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#A4B0BE',
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#A4B0BE',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4081',
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
  },
  signOutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#A4B0BE',
  },
  listContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden', // Clip items to rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  listItemContent: {
     flexDirection: 'row',
     alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  listItemText: {
    fontSize: 16,
    color: '#2F3542',
  },
});