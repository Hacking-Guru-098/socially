import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { Settings, BarChart2, Briefcase, MessageCircle, LogOut, ShieldCheck } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const navigateToSettings = () => {
    router.push('/settings');
  };
  
  const navigateToAnalytics = () => {
    router.replace('/(tabs)/analytics');
  };
  
  const navigateToBusiness = () => {
    router.replace('/(tabs)/business');
  };
  
  const navigateToChat = () => {
    router.push('/chat');
  };
  
  const navigateToAdminDashboard = () => {
    router.push('/admin-dashboard');
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Profile',
          headerTitleStyle: styles.headerTitle,
          headerBackVisible: false
        }}
      />
      
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Hello, {user?.user_metadata?.display_name || 'User'}!
          </Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={navigateToAnalytics}>
              <BarChart2 size={24} color="#6C63FF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={navigateToBusiness}>
              <Briefcase size={24} color="#6C63FF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Business</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={navigateToChat}>
              <MessageCircle size={24} color="#6C63FF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={navigateToSettings}>
              <Settings size={24} color="#6C63FF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
            
            {user?.user_metadata?.role === 'admin' && (
              <TouchableOpacity style={styles.adminButton} onPress={navigateToAdminDashboard}>
                <Text style={styles.adminButtonText}>Admin Dashboard</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#FF6B6B" style={styles.buttonIcon} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#2F3542',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2F3542',
  },
  adminButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B6B',
  },
});