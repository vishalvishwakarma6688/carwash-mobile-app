import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
    overflow: 'hidden',
  },
});
