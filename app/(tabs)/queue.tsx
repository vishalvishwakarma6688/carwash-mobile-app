import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGetBranchQueue, useUpdateQueueStatus } from '../../hooks/useQueue';
import { useGetProfile } from '../../hooks/useAuth';

const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 12;

export default function QueueScreen() {
  const { data: profile } = useGetProfile();
  const { data: queueItems, isLoading } = useGetBranchQueue(profile?.businessId || '');
  const updateQueueStatusMutation = useUpdateQueueStatus();

  const isBusinessStaff = profile?.role === 'BUSINESS_OWNER' || profile?.role === 'BRANCH_MANAGER' || profile?.role === 'EMPLOYEE';
  const totalQueued = queueItems?.length || 0;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateQueueStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          Alert.alert('Status Updated ✨', `Wash status updated to ${newStatus.replace('_', ' ')}.`);
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.message || 'Failed to update status.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Queue Board</Text>
          <Text style={styles.headerSub}>
            {isBusinessStaff
              ? 'Manage and update incoming car wash operational workflow'
              : 'Real-time car wash operational workflow status'}
          </Text>
        </View>

        {/* Live Status Summary Card */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalQueued}</Text>
              <Text style={styles.summaryLabel}>Vehicles Queued</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>~15m</Text>
              <Text style={styles.summaryLabel}>Avg Wash Time</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.accentEmerald }]}>Active</Text>
              <Text style={styles.summaryLabel}>Bay Status</Text>
            </View>
          </View>
        </GlassCard>

        {/* Queue Items List */}
        <View style={styles.queueList}>
          {isLoading ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading live queue board...</Text>
            </GlassCard>
          ) : !queueItems || queueItems.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="time-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Queue is Currently Empty</Text>
              <Text style={styles.emptyText}>
                No vehicles queued in this branch right now. Check back when a wash is in progress!
              </Text>
            </GlassCard>
          ) : (
            queueItems.map((item: any, index: number) => (
              <GlassCard key={item.id} style={styles.queueCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.numBadge}>
                    <Text style={styles.numText}>#{String(index + 1).padStart(2, '0')}</Text>
                  </View>
                  <View style={[styles.statusTag, { borderColor: COLORS.primaryCyan }]}>
                    <Text style={[styles.statusText, { color: COLORS.primaryCyan }]}>
                      {(item.status || 'WAITING').replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.vehicleTitle}>
                  {item.vehicle?.brand || 'Vehicle'} • {item.vehicle?.plateNumber || 'N/A'}
                </Text>
                <Text style={styles.serviceSubtitle}>
                  {item.booking?.customer?.name || 'Walk-In Customer'}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.footerText}>
                      Arrival: {new Date(item.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  {/* Business Staff Status Manager Buttons */}
                  {isBusinessStaff && (
                    <View style={styles.actionRow}>
                      {item.status === 'WAITING' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.primaryCyan }]}
                          onPress={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                        >
                          <Text style={[styles.actionBtnText, { color: '#000000' }]}>Start Wash</Text>
                        </TouchableOpacity>
                      )}
                      {item.status === 'IN_PROGRESS' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.accentEmerald }]}
                          onPress={() => handleStatusChange(item.id, 'COMPLETED')}
                        >
                          <Text style={[styles.actionBtnText, { color: '#000000' }]}>Complete Wash</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </GlassCard>
            ))
          )}
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
  summaryCard: { marginBottom: 24, paddingVertical: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900' },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  divider: { width: 1, height: 32, backgroundColor: COLORS.glassBorder },
  queueList: { gap: 14 },
  emptyCard: { padding: 28, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 10 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },
  queueCard: { padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  numBadge: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: COLORS.glassBorder, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.md },
  numText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' },
  statusTag: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '800' },
  vehicleTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800' },
  serviceSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  cardFooter: { marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { color: COLORS.textSecondary, fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '800' },
});
