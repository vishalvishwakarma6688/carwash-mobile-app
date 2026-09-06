import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useGetBookings, useCreateBooking, useUpdateBookingStatus } from '../../hooks/useBookings';
import { useGetServices } from '../../hooks/useServices';
import { useGetBusinesses } from '../../hooks/useBusinesses';
import { useGetProfile } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 12;

export default function BookingsScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfile();

  const isBusinessOwner =
    profile?.role === 'BUSINESS_OWNER' ||
    profile?.role === 'BRANCH_MANAGER' ||
    profile?.role === 'SUPER_ADMIN';

  // Registered Businesses Data
  const { data: businesses, isLoading: businessesLoading } = useGetBusinesses();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Auto-select first registered business when data loads
  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses]);

  // Catalog Services Data for the selected business
  const { data: services, isLoading: servicesLoading } = useGetServices(selectedBusinessId || undefined);

  // Business Owner Incoming Orders Data
  const { data: incomingBookings, isLoading: bookingsLoading } = useGetBookings({
    branchId: profile?.branchId || undefined,
  });

  const createBookingMutation = useCreateBooking();
  const updateBookingStatusMutation = useUpdateBookingStatus();

  // Customer Booking Form State
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

  // Customer submit handler
  const handleBookNow = () => {
    if (!profile) {
      Alert.alert('Authentication Required', 'Please sign in to book an appointment.', [
        { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
      ]);
      return;
    }

    if (!selectedBusinessId) {
      Alert.alert('Business Required', 'Please select a registered car wash business.');
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

    const selectedBiz = businesses?.find((b: any) => b.id === selectedBusinessId);
    const targetBranchId = selectedBiz?.branches?.[0]?.id || selectedBusinessId;

    const finalSlot = getFinalTimeSlot();
    const finalDateIso = getFinalBookingDateIso();

    createBookingMutation.mutate(
      {
        branchId: targetBranchId,
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

  // Business Owner update booking status handler
  const handleCheckInBooking = (bookingId: string) => {
    updateBookingStatusMutation.mutate(
      { id: bookingId, status: 'CHECKED_IN' },
      {
        onSuccess: () => {
          Alert.alert('Vehicle Checked In 🎉', 'Vehicle pushed to Live Queue Board successfully.');
          router.push('/queue' as any);
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.message || 'Failed to check in vehicle.');
        },
      }
    );
  };

  // ==================== BUSINESS OWNER INCOMING ORDERS VIEW ====================
  if (isBusinessOwner) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Received Customer Orders</Text>
            <Text style={styles.headerSub}>Full details of incoming bookings, customer info, and location</Text>
          </View>

          <View style={{ gap: 16 }}>
            {bookingsLoading ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>Loading incoming customer requests...</Text>
              </GlassCard>
            ) : !incomingBookings || incomingBookings.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Orders Received Yet</Text>
                <Text style={styles.emptyText}>
                  Customer bookings for your business branch will appear here with full customer & vehicle details.
                </Text>
              </GlassCard>
            ) : (
              incomingBookings.map((b: any) => {
                const serviceList = b.bookingServices
                  ? b.bookingServices.map((bs: any) => bs.service?.name || bs.package?.name).join(', ')
                  : 'Standard Car Wash';

                return (
                  <GlassCard key={b.id} style={styles.orderCard}>
                    {/* Header: Order ID & Status Badge */}
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderIdText}>Order #{b.id.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.orderTimeText}>
                          Created: {new Date(b.createdAt || b.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={[styles.statusTag, { borderColor: COLORS.primaryCyan }]}>
                        <Text style={[styles.statusText, { color: COLORS.primaryCyan }]}>
                          {b.status || 'CONFIRMED'}
                        </Text>
                      </View>
                    </View>

                    {/* Section 1: Customer Details */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>👤 Customer Details</Text>
                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={16} color={COLORS.primaryCyan} />
                        <Text style={styles.detailValueBold}>{b.customer?.name || 'Customer'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={16} color={COLORS.accentEmerald} />
                        <Text style={styles.detailValue}>Phone: {b.customer?.phone || 'N/A'}</Text>
                      </View>
                      {b.customer?.email && (
                        <View style={styles.detailRow}>
                          <Ionicons name="mail-outline" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.detailValue}>Email: {b.customer.email}</Text>
                        </View>
                      )}
                    </View>

                    {/* Section 2: Vehicle Information */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>🚗 Vehicle Details</Text>
                      <View style={styles.detailRow}>
                        <Ionicons name="car-sport-outline" size={16} color={COLORS.primaryBlue} />
                        <Text style={styles.detailValueBold}>
                          {b.vehicle?.brand || 'Car'} {b.vehicle?.model || ''}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailValue}>
                          Plate: {b.vehicle?.plateNumber || 'N/A'} • Type: {b.vehicle?.vehicleType || 'SEDAN'}
                        </Text>
                      </View>
                    </View>

                    {/* Section 3: Wash Service & Pricing */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>✨ Requested Service & Price</Text>
                      <Text style={styles.serviceNameText}>{serviceList}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.totalPriceText}>Total: ${Number(b.totalAmount).toFixed(2)}</Text>
                        <Text style={styles.paymentStatusText}>
                          Payment: {b.paymentStatus || 'PENDING'}
                        </Text>
                      </View>
                    </View>

                    {/* Section 4: Location & Appointment Slot */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>📍 Location & Schedule</Text>
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.accentGold} />
                        <Text style={styles.detailValueBold}>
                          {new Date(b.bookingDate).toLocaleDateString()} • {b.timeSlot}
                        </Text>
                      </View>

                      {b.locationType === 'DOORSTEP_HOME' ? (
                        <View style={styles.doorstepBox}>
                          <Ionicons name="home-outline" size={18} color={COLORS.accentGold} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.doorstepTitle}>Doorstep Home Wash Service</Text>
                            <Text style={styles.doorstepAddressText}>Address: {b.address}</Text>
                            {b.landmark ? (
                              <Text style={styles.doorstepSubText}>Landmark: {b.landmark}</Text>
                            ) : null}
                          </View>
                        </View>
                      ) : (
                        <View style={styles.branchBox}>
                          <Ionicons name="storefront-outline" size={16} color={COLORS.primaryCyan} />
                          <Text style={styles.branchText}>In-Branch Drive-In Appointment</Text>
                        </View>
                      )}
                    </View>

                    {/* Footer Action Buttons */}
                    <View style={styles.orderFooter}>
                      {b.status !== 'CHECKED_IN' && b.status !== 'COMPLETED' ? (
                        <CustomButton
                          title="Check-In Vehicle to Bay →"
                          onPress={() => handleCheckInBooking(b.id)}
                          style={{ flex: 1 }}
                        />
                      ) : (
                        <View style={styles.checkedInBadge}>
                          <Ionicons name="checkmark-circle" size={18} color={COLORS.accentEmerald} />
                          <Text style={styles.checkedInText}>Vehicle Currently Checked In</Text>
                        </View>
                      )}
                    </View>
                  </GlassCard>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==================== RETAIL CUSTOMER BOOKING VIEW ====================
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Car Wash</Text>
          <Text style={styles.headerSub}>Select registered business, service type, date, and time slot</Text>
        </View>

        {/* 1. Select Registered Car Wash Business */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Car Wash Business</Text>
          {businessesLoading ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading registered car wash businesses...</Text>
            </GlassCard>
          ) : !businesses || businesses.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="storefront-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Businesses Registered Yet</Text>
              <Text style={styles.emptyText}>
                Register a Car Wash Business account to list your center and services here.
              </Text>
            </GlassCard>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {businesses.map((biz: any) => {
                const isSelected = selectedBusinessId === biz.id;
                return (
                  <TouchableOpacity
                    key={biz.id}
                    onPress={() => {
                      setSelectedBusinessId(biz.id);
                      setSelectedServiceId(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <GlassCard style={[styles.bizCard, isSelected && styles.selectedBizCard]}>
                      <View style={styles.bizHeader}>
                        <View style={[styles.bizIconCircle, isSelected && styles.selectedBizIconCircle]}>
                          <Ionicons
                            name="storefront"
                            size={20}
                            color={isSelected ? COLORS.primaryCyan : COLORS.textSecondary}
                          />
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryCyan} />
                        )}
                      </View>
                      <Text style={styles.bizName}>{biz.name}</Text>
                      <Text style={styles.bizAddress} numberOfLines={1}>
                        📍 {biz.branches?.[0]?.address || biz.address || 'Main Branch Location'}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 2. Service Location Mode Segmented Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Select Service Type</Text>
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
            <Text style={styles.sectionTitle}>3. Doorstep Home Address</Text>
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

        {/* Dynamic Catalog Services Selection for Selected Business */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locationType === 'DOORSTEP_HOME' ? '4.' : '3.'} Select Wash Service Catalog
          </Text>
          {servicesLoading ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading business catalog...</Text>
            </GlassCard>
          ) : !services || services.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="water-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Services Added Yet</Text>
              <Text style={styles.emptyText}>
                This business has not created catalog services yet. Log in as this Business Owner to add packages!
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
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.serviceName}>{s.name}</Text>
                          {s.description && (
                            <Text style={styles.serviceDesc} numberOfLines={2}>
                              {s.description}
                            </Text>
                          )}
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

        {/* Select Booking Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locationType === 'DOORSTEP_HOME' ? '5.' : '4.'} Select Booking Date
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

        {/* Select Available Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locationType === 'DOORSTEP_HOME' ? '6.' : '5.'} Select Time Slot
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
  bizCard: { width: 170, padding: 14 },
  selectedBizCard: { borderColor: COLORS.primaryCyan, backgroundColor: 'rgba(0, 245, 212, 0.12)' },
  bizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bizIconCircle: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  selectedBizIconCircle: { backgroundColor: 'rgba(0, 245, 212, 0.2)' },
  bizName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800' },
  bizAddress: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
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
  serviceCard: { marginBottom: 10, padding: 16 },
  selectedCard: { borderColor: COLORS.primaryCyan, backgroundColor: 'rgba(0, 245, 212, 0.08)' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: RADIUS.full, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  selectedIconCircle: { backgroundColor: 'rgba(0, 245, 212, 0.15)' },
  serviceName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  serviceDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  serviceDuration: { color: COLORS.primaryCyan, fontSize: 11, fontWeight: '700', marginTop: 4 },
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
  orderCard: { padding: 18 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderIdText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900' },
  orderTimeText: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  statusTag: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '800' },
  detailSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, gap: 4 },
  detailSectionTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailValueBold: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  detailValue: { color: COLORS.textSecondary, fontSize: 13 },
  serviceNameText: { color: COLORS.primaryCyan, fontSize: 15, fontWeight: '800' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalPriceText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900' },
  paymentStatusText: { color: COLORS.accentGold, fontSize: 12, fontWeight: '800' },
  doorstepBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(255, 193, 7, 0.1)', padding: 10, borderRadius: RADIUS.md, marginTop: 6 },
  doorstepTitle: { color: COLORS.accentGold, fontSize: 13, fontWeight: '800' },
  doorstepAddressText: { color: COLORS.textPrimary, fontSize: 13, marginTop: 2 },
  doorstepSubText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  branchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  branchText: { color: COLORS.textSecondary, fontSize: 13 },
  orderFooter: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.glassBorder },
  checkedInBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, backgroundColor: 'rgba(0, 245, 212, 0.1)', borderRadius: RADIUS.md },
  checkedInText: { color: COLORS.accentEmerald, fontSize: 13, fontWeight: '800' },
});
