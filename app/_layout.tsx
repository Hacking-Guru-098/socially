import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { SplashScreen, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

// Keep the splash screen visible until the app is ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  React.useEffect(() => {
    // Hide the splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AuthProvider>
        <AuthStateManager>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            
            {/* Regular screens outside the tabs */}
            <Stack.Screen name="analytics" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="profile-edit" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="setup-2fa" />
            <Stack.Screen name="admin-dashboard" />
            {/* Add placeholders for new screens */}
            <Stack.Screen name="deal/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="rate-card-edit" options={{ presentation: 'modal' }} />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="ai-suggestions" />
            {/* Catch-all route - make sure it's last */}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </AuthStateManager>
      </AuthProvider>
    </View>
  );
}

// This component handles redirects based on auth state
function AuthStateManager({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAuthRoute = ['login', 'register', 'forgot-password'].includes(segments[1] || '');

    if (!user && !inAuthGroup && !isAuthRoute) {
      // If not logged in and trying to access a protected route, redirect to login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // If logged in and trying to access an auth route, redirect to home
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  return <>{children}</>}