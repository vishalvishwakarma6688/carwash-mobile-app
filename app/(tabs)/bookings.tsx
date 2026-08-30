import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useGetBookings, useCreateBooking } from '../../hooks/useBookings';
import { useGetServices } from '../../hooks/useServices';
import { useGetProfile } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 12;

export default function BookingsScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { data: services, isLoading: servicesLoading } = useGetServices(profile?.businessId);
  const createBookingMutation = useCreateBooking();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 10:30 AM');

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '10:00 AM - 10:30 AM',
    '11:00 AM - 11:30 AM',
    '02:00 PM - 02:30 PM',
    '04:00 PM - 04:30 PM',
  ];

  const handleBookNow = () => {
    if (!profile) {
      Alert.alert('Authentication Required', 'Please sign in to book an appointment.', [
        { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
      ]);
      return;
    }

    if (!selectedServiceId) {
      Alert.alert('Service Selection', 'Please select a wash service from the catalog.');
      return;
    }

    createBookingMutation.mutate(
      {
        branchId: profile?.businessId || '',
        customerId: profile?.id || '',
        vehicleId: '',
        bookingDate: new Date().toISOString(),
        timeSlot: selectedSlot,
        serviceIds: [selectedServiceId],
      },
      {
        onSuccess: () => {
          Alert.alert('Booking Reserved 🎉', 'Your appointment has been registered successfully.');
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Booking request created.';
          Alert.alert('Booking Status', message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Car Wash</Text>
          <Text style={styles.headerSub}>Select catalog service and preferred appointment slot</Text>
        </View>

        {/* Catalog Services Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Wash Service</Text>
          {servicesLoading ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading services catalog...</Text>
            </GlassCard>
          ) : !services || services.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="water-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Catalog Services Registered</Text>
              <Text style={styles.emptyText}>
                No car wash services found for this business yet. Create services via backend API.
              </Text>
            </GlassCard>
          ) : (
            services.map((s: any) => {
              const isSelected = selectedServiceId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedServiceId(s.id)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={[styles.serviceCard, isSelected && styles.selectedCard]}>
                    <View style={styles.serviceRow}>
                      <View style={styles.serviceLeft}>
                        <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
                          <Ionicons
                            name="sparkles-outline"
                            size={22}
                            color={isSelected ? COLORS.primaryCyan : COLORS.textSecondary}
                          />
                        </View>
                        <View>
                          <Text style={styles.serviceName}>{s.name}</Text>
                          <Text style={styles.serviceDuration}>⏱ {s.estimatedDurationMinutes || 30} mins</Text>
                        </View>
                      </View>
                      <Text style={styles.servicePrice}>${Number(s.price).toFixed(2)}</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Time Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Select Available Slot</Text>
          <View style={styles.slotsGrid}>
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotPill, isSelected && styles.selectedSlotPill]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Confirm Action Button */}
        <View style={styles.section}>
          <CustomButton
            title="Confirm Booking Reservation →"
            onPress={handleBookNow}
            disabled={createBookingMutation.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  header: { marginTop: STATUS_BAR_OFFSET, marginBottom: 20 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900' },
  headerSub: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  emptyCard: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 10 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },
  serviceCard: { marginBottom: 10 },
  selectedCard: { borderColor: COLORS.primaryCyan, backgroundColor: 'rgba(0, 245, 212, 0.08)' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: RADIUS.full, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  selectedIconCircle: { backgroundColor: 'rgba(0, 245, 212, 0.15)' },
  serviceName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  serviceDuration: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  servicePrice: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotPill: { width: '48%', backgroundColor: COLORS.glassBackground, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
  selectedSlotPill: { backgroundColor: COLORS.primaryCyan, borderColor: COLORS.primaryCyan },
  slotText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  selectedSlotText: { color: '#000000', fontWeight: '800' },
});
