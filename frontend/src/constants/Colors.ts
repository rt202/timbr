// Luxury Black & Gold Color Palette
export const Colors = {
  // Primary Colors
  primary: '#1a1a1a',        // Deep black
  secondary: '#B8860B',      // Dark goldenrod (Ferrero Rocher style)
  accent: '#DAA520',         // Goldenrod
  
  // Gold Variations
  gold: '#B8860B',           // Primary gold
  lightGold: '#DAA520',      // Lighter gold
  darkGold: '#996F00',       // Darker gold
  paleGold: '#F4E4BC',       // Very light gold/cream
  
  // Blacks & Grays
  black: '#000000',
  charcoal: '#1a1a1a',
  darkGray: '#2a2a2a',
  mediumGray: '#4a4a4a',
  lightGray: '#6a6a6a',
  
  // Supporting Colors
  white: '#FFFFFF',
  cream: '#FDF5E6',          // Warm white with gold tint
  background: '#0f0f0f',     // Very dark background
  cardBackground: '#1a1a1a', // Card backgrounds
  
  // Status Colors (luxury versions)
  success: '#2E8B57',        // Sea green
  error: '#8B0000',          // Dark red
  warning: '#B8860B',        // Use gold for warnings
  info: '#4682B4',           // Steel blue
  
  // Opacity variations
  goldOpacity20: 'rgba(184, 134, 11, 0.2)',
  goldOpacity50: 'rgba(184, 134, 11, 0.5)',
  blackOpacity20: 'rgba(26, 26, 26, 0.2)',
  blackOpacity50: 'rgba(26, 26, 26, 0.5)',
  blackOpacity80: 'rgba(26, 26, 26, 0.8)',
};

export const LuxuryTheme = {
  colors: Colors,
  
  // Typography
  fonts: {
    heading: 'System', // You can replace with custom luxury fonts
    body: 'System',
    accent: 'System',
  },
  
  // Shadows for luxury feel
  shadows: {
    gold: {
      shadowColor: Colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    dark: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  
  // Border radius for consistent luxury styling
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
  },
};
