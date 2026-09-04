import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetProfile } from '../hooks/useAuth';
import { COLORS, RADIUS } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';

export default function IndexScreen() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useGetProfile();

  useEffect(() => {
    if (!isLoading) {
      if (profile) {
        // User or Business is authenticated -> redirect automatically to Home Page
        router.replace('/(tabs)' as any);
      } else {
        // Unauthenticated -> redirect to Login Page
        router.replace('/auth/login' as any);
      }
    }
  }, [profile, isLoading, isError]);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.splashCard}>
        <View style={styles.logoCircle}>
          <Ionicons name="car-sport" size={32} color={COLORS.primaryCyan} />
        </View>
        <Text style={styles.appName}>Shine Auto Care</Text>
        <Text style={styles.tagline}>Verifying Session Authentication...</Text>
        <ActivityIndicator size="large" color={COLORS.primaryCyan} style={styles.loader} />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  splashCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 36,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 245, 212, 0.12)',
    borderColor: COLORS.primaryCyan,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  loader: {
    marginTop: 24,
  },
});
