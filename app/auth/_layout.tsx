import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { BackgroundGradientShape } from '../../components/ui/BackgroundGradientShape';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  return (
    <BackgroundGradientShape>
      <Stack
        initialRouteName="login"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </BackgroundGradientShape>
  );
}
