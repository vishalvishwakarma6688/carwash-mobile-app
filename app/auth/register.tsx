import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useRegister, useGetProfile } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfile();

  React.useEffect(() => {
    if (profile) {
      router.replace('/(tabs)' as any);
    }
  }, [profile]);
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'BUSINESS_OWNER'>('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Business Owner Specific Fields
  const [businessName, setBusinessName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  const registerMutation = useRegister();

  const handleRegister = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    if (accountType === 'BUSINESS_OWNER' && !businessName.trim()) {
      Alert.alert('Validation Error', 'Please enter your Car Wash Business Name.');
      return;
    }

    registerMutation.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role: accountType,
        businessName: accountType === 'BUSINESS_OWNER' ? businessName.trim() : undefined,
        branchAddress: accountType === 'BUSINESS_OWNER' ? branchAddress.trim() : undefined,
      },
      {
        onSuccess: () => {
          const successTitle = accountType === 'BUSINESS_OWNER' ? 'Business Registered 🎉' : 'Account Created 🎉';
          const successBody = accountType === 'BUSINESS_OWNER'
            ? 'Your Car Wash Business & Main Branch have been set up successfully.'
            : 'Your customer profile has been created.';
          Alert.alert(successTitle, successBody);
          router.replace('/(tabs)' as any);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Registration failed.';
          Alert.alert('Registration Error', message);
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
              <Ionicons
                name={accountType === 'BUSINESS_OWNER' ? 'business' : 'person-add'}
                size={24}
                color={COLORS.primaryCyan}
              />
            </View>
            <Text style={styles.title}>
              {accountType === 'BUSINESS_OWNER' ? 'Register Business' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {accountType === 'BUSINESS_OWNER'
                ? 'List your car wash business to receive customer orders and manage queue operations'
                : 'Register your customer profile to book services and track status'}
            </Text>
          </View>

          {/* Account Type Segmented Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, accountType === 'CUSTOMER' && styles.toggleBtnActive]}
              onPress={() => setAccountType('CUSTOMER')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={accountType === 'CUSTOMER' ? COLORS.primaryCyan : COLORS.textSecondary}
              />
              <Text
                style={[styles.toggleText, accountType === 'CUSTOMER' && styles.toggleTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, accountType === 'BUSINESS_OWNER' && styles.toggleBtnActive]}
              onPress={() => setAccountType('BUSINESS_OWNER')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="storefront-outline"
                size={16}
                color={accountType === 'BUSINESS_OWNER' ? COLORS.primaryCyan : COLORS.textSecondary}
              />
              <Text
                style={[styles.toggleText, accountType === 'BUSINESS_OWNER' && styles.toggleTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Business Owner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Registration Form Card */}
          <GlassCard style={styles.card}>
            {/* Owner Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {accountType === 'BUSINESS_OWNER' ? 'Owner / Manager Name' : 'Full Name'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Business Specific Inputs */}
            {accountType === 'BUSINESS_OWNER' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Car Wash Business Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Express Auto Spa"
                      placeholderTextColor={COLORS.textMuted}
                      value={businessName}
                      onChangeText={setBusinessName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Main Branch Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 456 Commercial Blvd, Suite 10"
                      placeholderTextColor={COLORS.textMuted}
                      value={branchAddress}
                      onChangeText={setBranchAddress}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Email Address */}
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

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+1 987 654 3210"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <CustomButton
              title={
                registerMutation.isPending
                  ? 'Registering...'
                  : accountType === 'BUSINESS_OWNER'
                  ? 'Register Car Wash Business →'
                  : 'Create Customer Account →'
              }
              onPress={handleRegister}
              disabled={registerMutation.isPending}
              style={styles.registerButton}
            />
          </GlassCard>

          {/* Footer Login Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login' as any)} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 12,
    marginBottom: 16,
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
    marginBottom: 14,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(0, 245, 212, 0.12)',
    borderColor: COLORS.primaryCyan,
  },
  toggleText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  toggleTextActive: { color: COLORS.primaryCyan, fontWeight: '800' },
  card: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  registerButton: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primaryCyan,
    fontSize: 14,
    fontWeight: '700',
  },
});
