import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetProfile } from '../hooks/useAuth';
import { COLORS, RADIUS } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';

export default function IndexScreen() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useGetProfile();

  useEffect(() => {
    if (!isLoading) {
      if (profile) {
        // User is authenticated -> redirect directly to Home Dashboard
        router.replace('/(tabs)' as any);
      } else {
        // User is not authenticated -> redirect directly to Login Page
        router.replace('/auth/login' as any);
      }
    }
  }, [profile, isLoading, isError]);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.splashCard}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🚗</Text>
        </View>
        <Text style={styles.appName}>Car Wash Mobile</Text>
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
    backgroundColor: 'rgba(0, 245, 212, 0.15)',
    borderColor: COLORS.primaryCyan,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
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
