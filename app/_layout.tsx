import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';
import { BackgroundGradientShape } from '../components/ui/BackgroundGradientShape';
import { COLORS } from '../constants/theme';

export const unstable_settings = {
  initialRouteName: 'auth',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: '#0D0E12',
    text: COLORS.textPrimary,
    border: COLORS.glassBorder,
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={customDarkTheme}>
        <BackgroundGradientShape>
          <Stack
            initialRouteName="auth"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </BackgroundGradientShape>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
