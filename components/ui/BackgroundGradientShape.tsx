import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

/**
 * BackgroundGradientShape Component
 * Renders ambient geometric diamond background shapes & soft radial glows behind screens.
 */
export const BackgroundGradientShape: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Top Right Geometric Diamond Shape 1 */}
      <View style={[styles.shape, styles.topRightDiamond]} />

      {/* Top Left Soft Glow Orb */}
      <View style={[styles.shape, styles.topLeftGlow]} />

      {/* Center Right Layered Geometric Diamond Shape 2 */}
      <View style={[styles.shape, styles.centerRightDiamond]} />

      {/* Bottom Left Geometric Accent Shape */}
      <View style={[styles.shape, styles.bottomLeftDiamond]} />

      {/* Main Screen Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  shape: {
    position: 'absolute',
    zIndex: 1,
  },
  topRightDiamond: {
    top: -height * 0.1,
    right: -width * 0.25,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 80,
    backgroundColor: COLORS.shapePrimary,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 212, 0.08)',
  },
  topLeftGlow: {
    top: height * 0.05,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: COLORS.shapeSecondary,
    opacity: 0.6,
  },
  centerRightDiamond: {
    top: height * 0.38,
    right: -width * 0.35,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 70,
    backgroundColor: COLORS.shapeAccent,
    transform: [{ rotate: '35deg' }],
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.05)',
  },
  bottomLeftDiamond: {
    bottom: -height * 0.12,
    left: -width * 0.25,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 60,
    backgroundColor: COLORS.shapePrimary,
    transform: [{ rotate: '50deg' }],
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 212, 0.06)',
  },
});
