import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useLogin } from '../../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email address and password.');
      return;
    }

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          router.replace('/(tabs)' as any);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Login failed. Please check your credentials.';
          Alert.alert('Authentication Failed', message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Brand Section */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="car-sport" size={26} color={COLORS.primaryCyan} />
            </View>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Enter your account credentials to access your dashboard</Text>
          </View>

          {/* Login Form Card */}
          <GlassCard style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <CustomButton
              title={loginMutation.isPending ? 'Signing In...' : 'Sign In to Account'}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              style={styles.loginButton}
            />
          </GlassCard>

          {/* Footer Register Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/register' as any)} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 48 : 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    marginTop: 12,
    marginBottom: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 245, 212, 0.1)',
    borderColor: 'rgba(0, 245, 212, 0.3)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  loginButton: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primaryCyan,
    fontSize: 14,
    fontWeight: '700',
  },
});
