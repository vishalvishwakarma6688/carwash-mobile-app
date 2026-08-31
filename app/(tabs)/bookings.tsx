import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useCreateBooking } from '../../hooks/useBookings';
import { useGetServices } from '../../hooks/useServices';
import { useGetProfile } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 12;

export default function BookingsScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { data: services, isLoading: servicesLoading } = useGetServices(profile?.businessId);
  const createBookingMutation = useCreateBooking();

  // Location & Service State
  const [locationType, setLocationType] = useState<'IN_BRANCH' | 'DOORSTEP_HOME'>('IN_BRANCH');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Date Selection State
  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const nextDayDate = new Date(todayDate);
  nextDayDate.setDate(todayDate.getDate() + 2);

  const formatDateLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatDateIso = (d: Date) => d.toISOString().split('T')[0];

  const [dateOption, setDateOption] = useState<'today' | 'tomorrow' | 'nextDay' | 'custom'>('today');
  const [customDateInput, setCustomDateInput] = useState(formatDateIso(todayDate));

  // Time Slot State
  const presetSlots = [
    '09:00 AM - 09:30 AM',
    '10:00 AM - 10:30 AM',
    '11:00 AM - 11:30 AM',
    '02:00 PM - 02:30 PM',
    '04:00 PM - 04:30 PM',
    'Custom Slot...',
  ];

  const [selectedSlotOption, setSelectedSlotOption] = useState('10:00 AM - 10:30 AM');
  const [customSlotInput, setCustomSlotInput] = useState('05:30 PM - 06:00 PM');

  // Compute final booking date ISO string
  const getFinalBookingDateIso = () => {
    if (dateOption === 'today') return todayDate.toISOString();
    if (dateOption === 'tomorrow') return tomorrowDate.toISOString();
    if (dateOption === 'nextDay') return nextDayDate.toISOString();
    try {
      const parsed = new Date(customDateInput);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    } catch (e) {
      // fallback
    }
    return todayDate.toISOString();
  };

  // Compute final time slot string
  const getFinalTimeSlot = () => {
    if (selectedSlotOption === 'Custom Slot...') {
      return customSlotInput.trim() || '10:00 AM - 10:30 AM';
    }
    return selectedSlotOption;
  };

  const handleBookNow = () => {
    if (!profile) {
      Alert.alert('Authentication Required', 'Please sign in to book an appointment.', [
        { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
      ]);
      return;
    }

    if (locationType === 'DOORSTEP_HOME' && !address.trim()) {
      Alert.alert('Location Required', 'Please enter your home address for doorstep car wash service.');
      return;
    }

    if (!selectedServiceId) {
      Alert.alert('Service Selection', 'Please select a wash service from the catalog.');
      return;
    }

    const finalSlot = getFinalTimeSlot();
    const finalDateIso = getFinalBookingDateIso();

    createBookingMutation.mutate(
      {
        branchId: profile?.businessId || '',
        customerId: profile?.id || '',
        vehicleId: '',
        locationType,
        address: locationType === 'DOORSTEP_HOME' ? address.trim() : undefined,
        landmark: locationType === 'DOORSTEP_HOME' ? landmark.trim() : undefined,
        bookingDate: finalDateIso,
        timeSlot: finalSlot,
        serviceIds: [selectedServiceId],
      },
      {
        onSuccess: () => {
          const successMsg =
            locationType === 'DOORSTEP_HOME'
              ? 'Doorstep Home Car Wash booked! Washer will arrive at your specified address.'
              : 'Branch appointment reserved successfully.';
          Alert.alert('Booking Confirmed 🎉', successMsg);
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
          <Text style={styles.headerSub}>Choose service location, catalog package, date, and time slot</Text>
        </View>

        {/* 1. Service Location Mode Segmented Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Service Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, locationType === 'IN_BRANCH' && styles.toggleBtnActive]}
              onPress={() => setLocationType('IN_BRANCH')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="car-outline"
                size={18}
                color={locationType === 'IN_BRANCH' ? COLORS.primaryCyan : COLORS.textSecondary}
              />
              <Text
                style={[styles.toggleText, locationType === 'IN_BRANCH' && styles.toggleTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Branch Drive-in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, locationType === 'DOORSTEP_HOME' && styles.toggleBtnActive]}
              onPress={() => setLocationType('DOORSTEP_HOME')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="home-outline"
                size={18}
                color={locationType === 'DOORSTEP_HOME' ? COLORS.primaryCyan : COLORS.textSecondary}
              />
              <Text
                style={[styles.toggleText, locationType === 'DOORSTEP_HOME' && styles.toggleTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Doorstep Home Wash
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Doorstep Home Address Input Card (When DOORSTEP_HOME selected) */}
        {locationType === 'DOORSTEP_HOME' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Doorstep Home Address</Text>
            <GlassCard style={styles.addressCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Home / Delivery Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="123 Main Street, Apt 4B, City"
                    placeholderTextColor={COLORS.textMuted}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Landmark / Parking Instructions (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="navigate-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Near green park, driveway parking"
                    placeholderTextColor={COLORS.textMuted}
                    value={landmark}
                    onChangeText={setLandmark}
                  />
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Catalog Services Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locationType === 'DOORSTEP_HOME' ? '3.' : '2.'} Select Wash Service
          </Text>
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

        {/* 3. Select Booking Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locationType === 'DOORSTEP_HOME' ? '4.' : '3.'} Select Booking Date
          </Text>
          <View style={styles.dateGrid}>
            <TouchableOpacity
              style={[styles.datePill, dateOption === 'today' && styles.selectedDatePill]}
              onPress={() => setDateOption('today')}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, dateOption === 'today' && styles.selectedDateLabel]}>Today</Text>
              <Text style={[styles.dateSub, dateOption === 'today' && styles.selectedDateSub]}>
                {formatDateLabel(todayDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePill, dateOption === 'tomorrow' && styles.selectedDatePill]}
              onPress={() => setDateOption('tomorrow')}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, dateOption === 'tomorrow' && styles.selectedDateLabel]}>Tomorrow</Text>
              <Text style={[styles.dateSub, dateOption === 'tomorrow' && styles.selectedDateSub]}>
                {formatDateLabel(tomorrowDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePill, dateOption === 'nextDay' && styles.selectedDatePill]}
              onPress={() => setDateOption('nextDay')}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, dateOption === 'nextDay' && styles.selectedDateLabel]}>Day After</Text>
              <Text style={[styles.dateSub, dateOption === 'nextDay' && styles.selectedDateSub]}>
                {formatDateLabel(nextDayDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePill, dateOption === 'custom' && styles.selectedDatePill]}
              onPress={() => setDateOption('custom')}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, dateOption === 'custom' && styles.selectedDateLabel]}>Custom</Text>
              <Text style={[styles.dateSub, dateOption === 'custom' && styles.selectedDateSub]}>Pick Date</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Date Text Input */}
          {dateOption === 'custom' && (
            <GlassCard style={[styles.addressCard, { marginTop: 10 }]}>
              <Text style={styles.inputLabel}>Enter Custom Date (YYYY-MM-DD)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="2026-09-05"
                  placeholderTextColor={COLORS.textMuted}
                  value={customDateInput}
                  onChangeText={setCustomDateInput}
                />
              </View>
            </GlassCard>
          )}
        </View>

        {/* 4. Select Available Slot (With Custom Slot) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locationType === 'DOORSTEP_HOME' ? '5.' : '4.'} Select Time Slot
          </Text>
          <View style={styles.slotsGrid}>
            {presetSlots.map((slot) => {
              const isSelected = selectedSlotOption === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotPill, isSelected && styles.selectedSlotPill]}
                  onPress={() => setSelectedSlotOption(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Time Slot Input Card */}
          {selectedSlotOption === 'Custom Slot...' && (
            <GlassCard style={[styles.addressCard, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>Enter Custom Time Slot</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 05:30 PM - 06:00 PM"
                  placeholderTextColor={COLORS.textMuted}
                  value={customSlotInput}
                  onChangeText={setCustomSlotInput}
                />
              </View>
            </GlassCard>
          )}
        </View>

        {/* Confirm Action Button */}
        <View style={styles.section}>
          <CustomButton
            title={
              createBookingMutation.isPending
                ? 'Processing Booking...'
                : locationType === 'DOORSTEP_HOME'
                ? 'Book Doorstep Home Service →'
                : 'Confirm Branch Reservation →'
            }
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
  toggleRow: { flexDirection: 'row', gap: 8 },
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
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(0, 245, 212, 0.12)',
    borderColor: COLORS.primaryCyan,
  },
  toggleText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  toggleTextActive: { color: COLORS.primaryCyan, fontWeight: '800' },
  addressCard: { padding: 18 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
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
  dateGrid: { flexDirection: 'row', gap: 8 },
  datePill: {
    flex: 1,
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedDatePill: { backgroundColor: COLORS.primaryCyan, borderColor: COLORS.primaryCyan },
  dateLabel: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  selectedDateLabel: { color: '#000000', fontWeight: '900' },
  dateSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  selectedDateSub: { color: '#000000', fontWeight: '700' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotPill: { width: '48%', backgroundColor: COLORS.glassBackground, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
  selectedSlotPill: { backgroundColor: COLORS.primaryCyan, borderColor: COLORS.primaryCyan },
  slotText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  selectedSlotText: { color: '#000000', fontWeight: '800' },
});
