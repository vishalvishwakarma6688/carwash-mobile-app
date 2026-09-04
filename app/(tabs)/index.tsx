import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { HeaderProfile } from '../../components/ui/HeaderProfile';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { QuickActionGrid } from '../../components/ui/QuickActionGrid';
import { useGetProfile } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetProfile();

  const isLoggedIn = !!profile;
  const isBusinessOwner =
    profile?.role === 'BUSINESS_OWNER' ||
    profile?.role === 'BRANCH_MANAGER' ||
    profile?.role === 'SUPER_ADMIN';

  // Customer Actions Grid
  const customerActions = [
    {
      id: 'book',
      title: 'Book Service',
      icon: 'calendar-outline' as const,
      iconColor: COLORS.primaryCyan,
      onPress: () => router.push('/bookings' as any),
    },
    {
      id: 'queue',
      title: 'Live Queue',
      icon: 'time-outline' as const,
      iconColor: COLORS.accentEmerald,
      onPress: () => router.push('/queue' as any),
    },
    {
      id: 'vehicles',
      title: 'My Vehicles',
      icon: 'car-sport-outline' as const,
      iconColor: COLORS.primaryBlue,
      onPress: () => {
        if (!isLoggedIn) router.push('/auth/login' as any);
        else router.push('/profile' as any);
      },
    },
    {
      id: 'rewards',
      title: 'Wash Rewards',
      icon: 'gift-outline' as const,
      iconColor: COLORS.accentGold,
      onPress: () => {
        if (!isLoggedIn) router.push('/auth/login' as any);
        else router.push('/profile' as any);
      },
    },
  ];

  // Business Owner Actions Grid
  const businessActions = [
    {
      id: 'incoming-orders',
      title: 'Incoming Orders',
      icon: 'receipt-outline' as const,
      iconColor: COLORS.primaryCyan,
      onPress: () => router.push('/bookings' as any),
    },
    {
      id: 'queue-controller',
      title: 'Queue Controller',
      icon: 'time-outline' as const,
      iconColor: COLORS.accentEmerald,
      onPress: () => router.push('/queue' as any),
    },
    {
      id: 'manage-services',
      title: 'Service Catalog',
      icon: 'options-outline' as const,
      iconColor: COLORS.primaryBlue,
      onPress: () => router.push('/profile' as any),
    },
    {
      id: 'branch-settings',
      title: 'Branch Settings',
      icon: 'settings-outline' as const,
      iconColor: COLORS.accentGold,
      onPress: () => router.push('/profile' as any),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Header Profile Greeting */}
        <HeaderProfile
          userName={profile?.fullName || 'Guest User'}
          userPhone={profile?.email || profile?.phone || 'Not logged in'}
          tierLabel={
            isLoggedIn
              ? `${profile?.role?.replace('_', ' ') || 'CUSTOMER'} • Active`
              : 'Tap Profile to Register or Sign In'
          }
        />

        {/* Hero Card: Dynamic Role Experience */}
        <View style={styles.heroWrapper}>
          <GlassCard style={styles.heroCard}>
            {!isLoggedIn ? (
              <View>
                <Text style={styles.heroTitle}>Shine Auto Care Mobile</Text>
                <Text style={styles.heroSubText}>
                  Register or Sign In to book appointment slots, track live wash queue status, or manage your car wash business.
                </Text>
                <View style={styles.authBtnRow}>
                  <CustomButton
                    title="Sign In"
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
            ) : isBusinessOwner ? (
              <View>
                <View style={styles.heroHeader}>
                  <View style={styles.heroUserInfo}>
                    <Text style={styles.heroSubTitle}>Car Wash Business</Text>
                    <Text style={styles.userNameLarge} numberOfLines={1} ellipsizeMode="tail">
                      {profile?.business?.name || `${profile.fullName}'s Car Wash`}
                    </Text>
                    <Text style={styles.userEmailText} numberOfLines={1} ellipsizeMode="tail">
                      📍 {profile?.branch?.name || profile?.branch?.address || 'Main Branch Center'}
                    </Text>
                  </View>

                  <View style={[styles.badgePill, { borderColor: COLORS.accentGold }]}>
                    <Ionicons name="storefront" size={13} color={COLORS.accentGold} />
                    <Text style={[styles.badgeText, { color: COLORS.accentGold }]}>BUSINESS</Text>
                  </View>
                </View>

                {/* Owner Performance Row */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>Active</Text>
                    <Text style={styles.metricLbl}>Branch Status</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>5 Bays</Text>
                    <Text style={styles.metricLbl}>Capacity</Text>
                  </View>
                </View>

                <CustomButton
                  title="Manage Incoming Customer Orders →"
                  onPress={() => router.push('/bookings' as any)}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : (
              <View>
                <View style={styles.heroHeader}>
                  <View style={styles.heroUserInfo}>
                    <Text style={styles.heroSubTitle}>Account Profile</Text>
                    <Text style={styles.userNameLarge} numberOfLines={1} ellipsizeMode="tail">
                      {profile.fullName}
                    </Text>
                    <Text style={styles.userEmailText} numberOfLines={1} ellipsizeMode="tail">
                      {profile.email}
                    </Text>
                  </View>

                  <View style={styles.badgePill}>
                    <Ionicons name="shield-checkmark" size={13} color={COLORS.primaryCyan} />
                    <Text style={styles.badgeText}>VERIFIED</Text>
                  </View>
                </View>

                <CustomButton
                  title="Book Wash Service Now →"
                  onPress={() => router.push('/bookings' as any)}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </GlassCard>
        </View>

        {/* Section: Car Wash Operations Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {isBusinessOwner ? 'Business Management' : 'Car Wash Operations'}
          </Text>
          <QuickActionGrid actions={isBusinessOwner ? businessActions : customerActions} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 32 },
  heroWrapper: { paddingHorizontal: SPACING.md, marginTop: 8 },
  heroCard: { padding: 20 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900' },
  heroSubText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 6, lineHeight: 20 },
  authBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroUserInfo: { flex: 1, marginRight: 8 },
  heroSubTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  userNameLarge: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', marginTop: 4 },
  userEmailText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 245, 212, 0.12)',
    borderColor: 'rgba(0, 245, 212, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeText: { color: COLORS.primaryCyan, fontSize: 10, fontWeight: '800' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.glassBorder },
  metricBox: { alignItems: 'center' },
  metricVal: { color: COLORS.primaryCyan, fontSize: 18, fontWeight: '900' },
  metricLbl: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: COLORS.glassBorder },
  sectionContainer: { paddingHorizontal: SPACING.md, marginTop: 24 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
});
