import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useGetProfile, useLogout } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 12;

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetProfile();
  const logoutMutation = useLogout();

  const isLoggedIn = !!profile;

  const menuItems = [
    { id: 'vehicles', label: 'My Vehicles Registry', icon: 'car-sport-outline' },
    { id: 'payments', label: 'Payment Methods & Receipts', icon: 'card-outline' },
    { id: 'loyalty', label: 'Loyalty Rewards & Points', icon: 'gift-outline' },
    { id: 'settings', label: 'App Settings & Preferences', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>User Account</Text>
        </View>

        {/* Dynamic Profile Card */}
        <GlassCard style={styles.profileCard}>
          {!isLoggedIn ? (
            <View style={styles.loggedOutBox}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>G</Text>
              </View>
              <Text style={styles.nameText}>Guest User</Text>
              <Text style={styles.emailText}>Sign in to access your car wash bookings & rewards</Text>
              <View style={styles.authRow}>
                <CustomButton
                  title="Sign In →"
                  onPress={() => router.push('/auth/login' as any)}
                  style={{ flex: 1 }}
                />
                <CustomButton
                  title="Register"
                  variant="glass"
                  onPress={() => router.push('/auth/register' as any)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  {(profile.fullName || 'User').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nameText}>{profile.fullName}</Text>
              <Text style={styles.emailText}>{profile.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{profile.role || 'CUSTOMER'}</Text>
              </View>
            </View>
          )}
        </GlassCard>

        {/* Account Options Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                if (!isLoggedIn) router.push('/auth/login' as any);
              }}
            >
              <GlassCard style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primaryCyan} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button if Logged In */}
        {isLoggedIn && (
          <View style={styles.logoutWrapper}>
            <CustomButton
              title="Sign Out Account"
              variant="glass"
              onPress={() => logoutMutation.mutate()}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  header: { marginTop: STATUS_BAR_OFFSET, marginBottom: 20 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900' },
  profileCard: { paddingVertical: 24, paddingHorizontal: 20, marginBottom: 24 },
  loggedOutBox: { alignItems: 'center', width: '100%' },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 245, 212, 0.15)',
    borderColor: COLORS.primaryCyan,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: COLORS.primaryCyan, fontSize: 32, fontWeight: '800' },
  nameText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  emailText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center' },
  authRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 12,
  },
  roleText: { color: COLORS.accentGold, fontSize: 11, fontWeight: '800' },
  menuSection: { gap: 10, marginBottom: 24 },
  menuCard: { paddingVertical: 16, paddingHorizontal: 18 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  logoutWrapper: { marginTop: 4 },
});
