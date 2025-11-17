export const Colors = {
  // Primary Brand Colors - Gaming Golden Theme
  primary: '#FFD700',      // Bright golden yellow (like in the image)
  primaryDark: '#FFA500',  // Orange-gold
  primaryLight: '#FFEB3B', // Lighter golden yellow
  
  // Dark Gaming Theme (matching the image)
  dark: {
    background: '#0A0A0A',     // Very dark background (almost black)
    surface: '#1C1C1C',       // Slightly lighter for cards
    surfaceLight: '#2A2A2A',  // Even lighter surface
    text: '#FFFFFF',          // Pure white text
    textSecondary: '#CCCCCC', // Light gray text
    textMuted: '#888888',     // Muted gray text
    border: '#333333',        // Dark border
    accent: '#FFD700',        // Bright golden accent
    accentSecondary: '#FFA500', // Orange-gold secondary
    success: '#4CAF50',       // Success green
    warning: '#FFD700',       // Golden warning (matches theme)
    error: '#F44336',         // Red for health/error
    info: '#2196F3',          // Blue info
    
    // Gaming-specific colors
    health: '#F44336',        // Red health bar
    xp: '#FFD700',            // Golden XP bar
    cardBackground: '#FFD700', // Golden card backgrounds
    cardText: '#1A1A1A',      // Dark text on golden cards
    streak: '#FF6B35',        // Orange flame for streaks
  },
  
  // Light Theme (keeping similar structure but less relevant for this design)
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceLight: '#F1F5F9',
    text: '#1A1A1A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    border: '#E2E8F0',
    accent: '#FFD700',
    accentSecondary: '#FFA500',
    success: '#4CAF50',
    warning: '#FFD700',
    error: '#F44336',
    info: '#2196F3',
    
    // Gaming-specific colors for light mode
    health: '#F44336',
    xp: '#FFD700',
    cardBackground: '#FFD700',
    cardText: '#1A1A1A',
    streak: '#FF6B35',
  },
  
  // Common colors that work in both themes
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Gaming-focused gradient combinations
  gradients: {
    primary: ['#FFD700', '#FFA500'],
    dark: ['#0A0A0A', '#1C1C1C'],
    accent: ['#FFD700', '#FF6B35'],
    gold: ['#FFD700', '#DAA520'],
  },
  
  // Status colors with gaming aesthetic
  status: {
    success: {
      main: '#4CAF50',
      light: 'rgba(76, 175, 80, 0.1)',
      dark: '#388E3C',
    },
    warning: {
      main: '#FFD700',
      light: 'rgba(255, 215, 0, 0.1)',
      dark: '#FFA000',
    },
    error: {
      main: '#F44336',
      light: 'rgba(244, 67, 54, 0.1)',
      dark: '#D32F2F',
    },
    info: {
      main: '#2196F3',
      light: 'rgba(33, 150, 243, 0.1)',
      dark: '#1976D2',
    },
  },
};

// Helper function to get theme colors
export const getThemeColors = (isDark: boolean) => {
  return isDark ? Colors.dark : Colors.light;
};

// Helper function for opacity
export const withOpacity = (color: string, opacity: number) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}; 