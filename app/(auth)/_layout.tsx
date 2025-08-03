import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user, twoFactorPending } = useAuth();

  useEffect(() => {
    if (user) {
      if (twoFactorPending) {
        router.replace('/verify-2fa');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, twoFactorPending]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-2fa" />
    </Stack>
  );
}