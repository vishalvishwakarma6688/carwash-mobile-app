import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants/theme';
import { StatusPill } from './StatusPill';

interface HeaderProfileProps {
  userName?: string;
  userPhone?: string;
  tierLabel?: string;
  onNotificationPress?: () => void;
}

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 16;

export const HeaderProfile: React.FC<HeaderProfileProps> = ({
  userName = 'Guest',
  userPhone = 'Not logged in',
  tierLabel = 'Welcome • Tap Profile to Sign In',
  onNotificationPress,
}) => {
  const avatarLetter = (userName || 'G').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Bar: Profile Avatar & Greetings + Action Icons */}
      <View style={styles.topRow}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.greetingText}>Welcome back</Text>
            <Text style={styles.phoneText} numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit>
              {userName}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-Header Status Pill */}
      <View style={styles.pillRow}>
        <StatusPill label={tierLabel} dotColor={COLORS.primaryCyan} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  phoneText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: {
    marginTop: 12,
  },
});
