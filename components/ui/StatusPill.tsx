import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface StatusPillProps {
  label: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  dotColor = COLORS.primaryCyan,
  style,
}) => {
  return (
    <View style={[styles.pill, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
