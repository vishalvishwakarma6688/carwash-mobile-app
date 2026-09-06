import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { useGetProfile, useLogout } from '../../hooks/useAuth';
import { useGetCustomerVehicles, useAddVehicle } from '../../hooks/useVehicles';
import { useGetPayments } from '../../hooks/usePayments';
import { useGetServices } from '../../hooks/useServices';
import { useRouter } from 'expo-router';

const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 12;

type ActiveSubView = 'main' | 'vehicles' | 'add-vehicle' | 'payments' | 'loyalty' | 'settings' | 'business-info' | 'service-catalog' | 'staff-roster';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const logoutMutation = useLogout();

  const isBusinessOwner =
    profile?.role === 'BUSINESS_OWNER' ||
    profile?.role === 'BRANCH_MANAGER' ||
    profile?.role === 'SUPER_ADMIN';

  const [activeSubView, setActiveSubView] = useState<ActiveSubView>('main');

  // Customer Vehicles Data
  const { data: vehicles, isLoading: vehiclesLoading } = useGetCustomerVehicles(profile?.id);
  const addVehicleMutation = useAddVehicle();

  // Business Services Data
  const { data: services, isLoading: servicesLoading } = useGetServices(profile?.businessId);

  // Payments Data
  const { data: payments, isLoading: paymentsLoading } = useGetPayments();

  // Add Vehicle Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('SEDAN');

  // App Settings State
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);

  const isLoggedIn = !!profile;

  const vehicleTypes = ['SEDAN', 'SUV', 'HATCHBACK', 'MOTORCYCLE', 'LUXURY', 'TRUCK'];

  const handleAddVehicleSubmit = () => {
    if (!brand.trim() || !model.trim() || !plateNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter brand, model, and plate number.');
      return;
    }

    addVehicleMutation.mutate(
      {
        customerId: profile?.id || '',
        brand: brand.trim(),
        model: model.trim(),
        plateNumber: plateNumber.trim(),
        color: color.trim() || undefined,
        vehicleType: selectedVehicleType,
      },
      {
        onSuccess: () => {
          Alert.alert('Vehicle Registered 🎉', `${brand} ${model} has been added to your profile.`);
          setBrand('');
          setModel('');
          setPlateNumber('');
          setColor('');
          setActiveSubView('vehicles');
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || 'Failed to add vehicle.';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  // Customer Menu Items
  const customerMenuItems = [
    { id: 'vehicles' as ActiveSubView, label: 'My Vehicles Registry', icon: 'car-sport-outline' },
    { id: 'payments' as ActiveSubView, label: 'Payment Methods & Receipts', icon: 'card-outline' },
    { id: 'loyalty' as ActiveSubView, label: 'Loyalty Rewards & Points', icon: 'gift-outline' },
    { id: 'settings' as ActiveSubView, label: 'App Settings & Preferences', icon: 'settings-outline' },
  ];

  // Business Owner Menu Items
  const businessMenuItems = [
    { id: 'business-info' as ActiveSubView, label: 'Business & Branch Info', icon: 'storefront-outline' },
    { id: 'service-catalog' as ActiveSubView, label: 'Service & Pricing Catalog', icon: 'options-outline' },
    { id: 'staff-roster' as ActiveSubView, label: 'Employee & Staff Roster', icon: 'people-outline' },
    { id: 'settings' as ActiveSubView, label: 'App Settings & Preferences', icon: 'settings-outline' },
  ];

  const currentMenuItems = isBusinessOwner ? businessMenuItems : customerMenuItems;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Navigation Title */}
        <View style={styles.header}>
          {activeSubView !== 'main' ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                if (activeSubView === 'add-vehicle') {
                  setActiveSubView('vehicles');
                } else {
                  setActiveSubView('main');
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {activeSubView === 'main' && (isBusinessOwner ? 'Business Management' : 'User Account')}
              {activeSubView === 'business-info' && 'Business & Branch Info'}
              {activeSubView === 'service-catalog' && 'Service Catalog'}
              {activeSubView === 'staff-roster' && 'Employee Roster'}
              {activeSubView === 'vehicles' && 'My Vehicles'}
              {activeSubView === 'add-vehicle' && 'Register New Vehicle'}
              {activeSubView === 'payments' && 'Payment Receipts'}
              {activeSubView === 'loyalty' && 'Loyalty Rewards'}
              {activeSubView === 'settings' && 'App Settings'}
            </Text>
            <Text style={styles.headerSub}>
              {activeSubView === 'main' && 'Manage your profile and account options'}
              {activeSubView === 'business-info' && 'View business contact details and location'}
              {activeSubView === 'service-catalog' && 'Manage wash packages and pricing'}
              {activeSubView === 'staff-roster' && 'Branch employee team members'}
              {activeSubView === 'vehicles' && 'Manage your personal vehicles'}
              {activeSubView === 'add-vehicle' && 'Add vehicle details for quick bookings'}
              {activeSubView === 'payments' && 'Transaction history and wash invoices'}
              {activeSubView === 'loyalty' && 'Points balance and exclusive member perks'}
              {activeSubView === 'settings' && 'Notifications, location & app preferences'}
            </Text>
          </View>
        </View>

        {/* ==================== SUB-VIEW: MAIN ==================== */}
        {activeSubView === 'main' && (
          <View>
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

            <View style={styles.menuSection}>
              {currentMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isLoggedIn) {
                      router.push('/auth/login' as any);
                    } else {
                      setActiveSubView(item.id);
                    }
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

            {isLoggedIn && (
              <View style={styles.logoutWrapper}>
                <CustomButton
                  title="Sign Out Account"
                  variant="glass"
                  onPress={() => logoutMutation.mutate()}
                />
              </View>
            )}
          </View>
        )}

        {/* ==================== SUB-VIEW: BUSINESS INFO ==================== */}
        {activeSubView === 'business-info' && (
          <View style={{ gap: 14 }}>
            <GlassCard style={styles.itemCard}>
              <Text style={styles.itemTitle}>Business Name</Text>
              <Text style={styles.itemSub}>{profile?.business?.name || `${profile?.fullName}'s Car Wash`}</Text>
            </GlassCard>
            <GlassCard style={styles.itemCard}>
              <Text style={styles.itemTitle}>Main Branch Location</Text>
              <Text style={styles.itemSub}>{profile?.branch?.address || profile?.business?.address || '456 Commercial Blvd'}</Text>
            </GlassCard>
            <GlassCard style={styles.itemCard}>
              <Text style={styles.itemTitle}>Owner Email & Phone</Text>
              <Text style={styles.itemSub}>{profile?.email} • {profile?.phone || 'N/A'}</Text>
            </GlassCard>
          </View>
        )}

        {/* ==================== SUB-VIEW: SERVICE CATALOG ==================== */}
        {activeSubView === 'service-catalog' && (
          <View style={{ gap: 14 }}>
            {servicesLoading ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>Loading service catalog...</Text>
              </GlassCard>
            ) : !services || services.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="water-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Services Configured</Text>
                <Text style={styles.emptyText}>Add wash services via your backend API catalog.</Text>
              </GlassCard>
            ) : (
              services.map((s: any) => (
                <GlassCard key={s.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{s.name}</Text>
                    <Text style={styles.itemTitle}>${Number(s.price).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.itemSub}>Duration: {s.estimatedDurationMinutes || 30} mins</Text>
                </GlassCard>
              ))
            )}
          </View>
        )}

        {/* ==================== SUB-VIEW: STAFF ROSTER ==================== */}
        {activeSubView === 'staff-roster' && (
          <View style={{ gap: 14 }}>
            <GlassCard style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{profile?.fullName}</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>MANAGER / OWNER</Text>
                </View>
              </View>
              <Text style={styles.itemSub}>Email: {profile?.email}</Text>
            </GlassCard>
          </View>
        )}

        {/* ==================== SUB-VIEW: VEHICLES ==================== */}
        {activeSubView === 'vehicles' && (
          <View style={{ gap: 14 }}>
            <CustomButton
              title="+ Register New Vehicle"
              onPress={() => setActiveSubView('add-vehicle')}
            />

            {vehiclesLoading ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>Loading vehicle registry...</Text>
              </GlassCard>
            ) : !vehicles || vehicles.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="car-sport-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Vehicles Registered</Text>
                <Text style={styles.emptyText}>Tap '+ Register New Vehicle' above to add your car.</Text>
              </GlassCard>
            ) : (
              vehicles.map((v: any) => (
                <GlassCard key={v.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Ionicons name="car-sport" size={24} color={COLORS.primaryCyan} />
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{v.vehicleType || 'SEDAN'}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemTitle}>{v.brand} {v.model}</Text>
                  <Text style={styles.itemSub}>Plate: {v.plateNumber} • Color: {v.color || 'N/A'}</Text>
                </GlassCard>
              ))
            )}
          </View>
        )}

        {/* ==================== SUB-VIEW: ADD VEHICLE PAGE ==================== */}
        {activeSubView === 'add-vehicle' && (
          <View>
            <GlassCard style={{ padding: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brand Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="car-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Toyota, Honda, BMW"
                    placeholderTextColor={COLORS.textMuted}
                    value={brand}
                    onChangeText={setBrand}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Model</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="construct-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Camry, Civic, X5"
                    placeholderTextColor={COLORS.textMuted}
                    value={model}
                    onChangeText={setModel}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>License Plate Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. ABC-1234"
                    placeholderTextColor={COLORS.textMuted}
                    value={plateNumber}
                    onChangeText={setPlateNumber}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Type</Text>
                <View style={styles.pillsGrid}>
                  {vehicleTypes.map((type) => {
                    const isSelected = selectedVehicleType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typePill, isSelected && styles.selectedTypePill]}
                        onPress={() => setSelectedVehicleType(type)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.typePillText, isSelected && styles.selectedTypePillText]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="color-palette-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Metallic Black"
                    placeholderTextColor={COLORS.textMuted}
                    value={color}
                    onChangeText={setColor}
                  />
                </View>
              </View>

              <CustomButton
                title={addVehicleMutation.isPending ? 'Saving Vehicle...' : 'Save & Register Vehicle →'}
                onPress={handleAddVehicleSubmit}
                disabled={addVehicleMutation.isPending}
                style={{ marginTop: 12 }}
              />
            </GlassCard>
          </View>
        )}

        {/* ==================== SUB-VIEW: PAYMENTS ==================== */}
        {activeSubView === 'payments' && (
          <View style={{ gap: 14 }}>
            {paymentsLoading ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>Loading payment invoices...</Text>
              </GlassCard>
            ) : !payments || payments.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Transaction History</Text>
                <Text style={styles.emptyText}>Your completed wash payments and receipts will appear here.</Text>
              </GlassCard>
            ) : (
              payments.map((p: any) => (
                <GlassCard key={p.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>${Number(p.amount).toFixed(2)}</Text>
                    <View style={[styles.badgePill, { borderColor: COLORS.accentEmerald }]}>
                      <Text style={[styles.badgeText, { color: COLORS.accentEmerald }]}>
                        {p.status || 'PAID'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemSub}>Method: {p.paymentMethod} • Invoice #{p.id.slice(0, 8)}</Text>
                  <Text style={styles.itemDate}>
                    {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </GlassCard>
              ))
            )}
          </View>
        )}

        {/* ==================== SUB-VIEW: LOYALTY ==================== */}
        {activeSubView === 'loyalty' && (
          <View style={{ gap: 14 }}>
            <GlassCard style={styles.loyaltyCard}>
              <Ionicons name="trophy" size={36} color={COLORS.accentGold} />
              <Text style={styles.loyaltyTitle}>120 Loyalty Points</Text>
              <Text style={styles.loyaltyTier}>GOLD VIP MEMBER</Text>
              <Text style={styles.loyaltyDesc}>
                Earn 1 point for every $1 spent. Redeem 100 points for a free hydrophobic spray wash!
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>Available Member Perks</Text>
            <GlassCard style={styles.itemCard}>
              <Text style={styles.itemTitle}>🎁 10% Off Hydrophobic Wax</Text>
              <Text style={styles.itemSub}>Unlocked for Gold VIP members</Text>
            </GlassCard>
            <GlassCard style={styles.itemCard}>
              <Text style={styles.itemTitle}>⚡ Priority Wash Bay Line</Text>
              <Text style={styles.itemSub}>Fast-track check-in priority</Text>
            </GlassCard>
          </View>
        )}

        {/* ==================== SUB-VIEW: SETTINGS ==================== */}
        {activeSubView === 'settings' && (
          <View style={{ gap: 12 }}>
            <GlassCard style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={22} color={COLORS.primaryCyan} />
                  <View>
                    <Text style={styles.settingTitle}>Wash Reminders & Status Alerts</Text>
                    <Text style={styles.settingSub}>Receive live notifications when wash is completed</Text>
                  </View>
                </View>
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={setPushNotificationsEnabled}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: COLORS.primaryCyan }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <Ionicons name="location-outline" size={22} color={COLORS.accentEmerald} />
                <View>
                  <Text style={styles.settingTitle}>Primary Car Wash Branch</Text>
                  <Text style={styles.settingSub}>
                    {profile?.branch?.name || 'Shine Auto Care • Main Center Branch'}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={22} color={COLORS.accentGold} />
                <View>
                  <Text style={styles.settingTitle}>App Appearance & Visuals</Text>
                  <Text style={styles.settingSub}>Glassmorphic Dark Mode (Active)</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.primaryBlue} />
                <View>
                  <Text style={styles.settingTitle}>Security & Privacy</Text>
                  <Text style={styles.settingSub}>Encrypted Secure Tokens Active</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={22} color={COLORS.textSecondary} />
                <View>
                  <Text style={styles.settingTitle}>App Version & Build</Text>
                  <Text style={styles.settingSub}>Shine Auto Care Mobile v1.0.0 Pro Edition</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  header: { marginTop: STATUS_BAR_OFFSET, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '900' },
  headerSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
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
  emptyCard: { padding: 28, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 10 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },
  itemCard: { padding: 18 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800' },
  itemSub: { color: COLORS.textSecondary, fontSize: 13 },
  itemDate: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  badgePill: { backgroundColor: 'rgba(0, 245, 212, 0.1)', borderColor: COLORS.primaryCyan, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { color: COLORS.primaryCyan, fontSize: 11, fontWeight: '800' },
  loyaltyCard: { padding: 24, alignItems: 'center' },
  loyaltyTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', marginTop: 10 },
  loyaltyTier: { color: COLORS.accentGold, fontSize: 13, fontWeight: '800', marginTop: 4 },
  loyaltyDesc: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginVertical: 10 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  pillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedTypePill: { backgroundColor: COLORS.primaryCyan, borderColor: COLORS.primaryCyan },
  typePillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  selectedTypePillText: { color: '#000000', fontWeight: '900' },
  settingCard: { padding: 18 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 10 },
  settingTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  settingSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
});
