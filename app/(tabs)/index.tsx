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

  const actions = [
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
      },
    },
    {
      id: 'rewards',
      title: 'Wash Rewards',
      icon: 'gift-outline' as const,
      iconColor: COLORS.accentGold,
      onPress: () => {
        if (!isLoggedIn) router.push('/auth/login' as any);
      },
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
              ? `${profile?.role || 'CUSTOMER'} • Active Account`
              : 'Tap Profile to Register or Sign In'
          }
        />

        {/* Hero Card: Dynamic Auth Banner or Customer Summary */}
        <View style={styles.heroWrapper}>
          <GlassCard style={styles.heroCard}>
            {!isLoggedIn ? (
              <View>
                <Text style={styles.heroTitle}>Shine Auto Care Mobile</Text>
                <Text style={styles.heroSubText}>
                  Register or Sign In to book appointment slots, track live wash queue status, and earn loyalty points.
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
          <Text style={styles.sectionTitle}>Car Wash Operations</Text>
          <QuickActionGrid actions={actions} />
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
  sectionContainer: { paddingHorizontal: SPACING.md, marginTop: 24 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
});
