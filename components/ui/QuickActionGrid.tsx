import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants/theme';

interface ActionItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
}

interface QuickActionGridProps {
  actions: ActionItem[];
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ actions }) => {
  return (
    <View style={styles.gridContainer}>
      {actions.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.gridCard}
          onPress={item.onPress}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
            <Ionicons name={item.icon} size={24} color={item.iconColor} />
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
