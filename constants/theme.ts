// Centralized Design System & Theme Variables
// Change variable values here to instantly update colors & glassmorphic styling across the entire mobile application.

export const COLORS = {
  // Base Theme Colors
  background: '#0B0C0E',
  backgroundSecondary: '#121418',
  surfaceDark: '#16181F',

  // Glassmorphic Card Translucent Colors
  glassBackground: 'rgba(255, 255, 255, 0.04)',
  glassBackgroundHover: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.09)',
  glassBorderActive: 'rgba(0, 245, 212, 0.4)',

  // Primary & Accent Colors
  primaryCyan: '#00F5D4',
  primaryBlue: '#3B82F6',
  accentGold: '#FFD166',
  accentPurple: '#A855F7',
  accentEmerald: '#10B981',
  dangerRed: '#EF4444',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9FA5',
  textMuted: '#5E6470',

  // Background Shape & Ambient Glow Colors
  shapePrimary: 'rgba(0, 245, 212, 0.06)',
  shapeSecondary: 'rgba(59, 130, 246, 0.05)',
  shapeAccent: 'rgba(168, 85, 247, 0.04)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export const GLASS_PRESETS = {
  card: {
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
  },
  buttonPrimary: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.full,
  },
};

// Backwards compatibility aliases for Expo template components
export const Colors = {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.background,
    tint: COLORS.primaryCyan,
    icon: COLORS.textSecondary,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.textPrimary,
  },
  dark: {
    text: COLORS.textPrimary,
    background: COLORS.background,
    tint: COLORS.primaryCyan,
    icon: COLORS.textSecondary,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.textPrimary,
  },
};
export const Fonts = TYPOGRAPHY.fontFamily;
