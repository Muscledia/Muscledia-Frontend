# Public Routines Button Design

## Visual Design

```
┌──────────────────────────────────────────────────────────┐
│                     Home Screen                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Character Avatar Section]                             │
│  [Health & XP Bars]                                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ╔══════════════════════════════════════════════════╗   │
│  ║  Browse Public Routines              ⤴          ║   │
│  ║  Discover community workout programs            ║   │
│  ╚══════════════════════════════════════════════════╝   │
│      ↑ Gradient Background (Accent Colors)              │
│      ↑ Shadow Effect for Depth                          │
│      ↑ TrendingUp Icon (Right Side)                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  My Routines (N)                                         │
│  [Routine Cards...]                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Button Specifications

### Layout
- **Position:** Between character section and "My Routines" section
- **Width:** Full width (minus padding)
- **Padding:** 16px margins
- **Border Radius:** 16px
- **Overflow:** Hidden (for gradient effect)

### Visual Elements

#### Background
- **Type:** Linear Gradient
- **Colors:** `theme.accent` → `theme.accentSecondary`
- **Direction:** Top-left to bottom-right
- **Gradient Stops:** 55%, 100%

#### Shadow
- **Color:** Black (#000)
- **Offset:** X: 0, Y: 4
- **Opacity:** 0.3
- **Radius:** 8px
- **Elevation (Android):** 8

#### Content
- **Padding:** 20px (all sides)
- **Layout:** Row (horizontal)
- **Alignment:** Space between
- **Items:**
  - Left: Text content (flex: 1)
  - Right: Icon (28px)

### Typography

#### Title Text
- **Content:** "Browse Public Routines"
- **Font Size:** 18px
- **Font Weight:** Bold (700)
- **Color:** `theme.cardText` (white on dark background)
- **Margin Bottom:** 4px

#### Subtitle Text
- **Content:** "Discover community workout programs"
- **Font Size:** 13px
- **Font Weight:** Regular (400)
- **Color:** `theme.cardText` (white on dark background)
- **Opacity:** 0.9

### Icon
- **Component:** `TrendingUp` (from lucide-react-native)
- **Size:** 28px
- **Color:** `theme.cardText`
- **Position:** Right side, vertically centered

### Interaction

#### Touch States
- **Active Opacity:** 0.9
- **Haptic Feedback:** Medium intensity
- **Animation:** Smooth scale-down on press

#### Navigation
- **Action:** `router.push('/public-routines')`
- **Timing:** Immediate on tap
- **Transition:** Default slide transition

## Code Structure

### Component Location
```
app/
  (tabs)/
    index.tsx  ← Button is here
```

### Button Component Code
```tsx
<TouchableOpacity
  style={[styles.publicRoutinesButton, { backgroundColor: theme.accent }]}
  onPress={async () => { await impact('medium'); router.push('/public-routines'); }}
  activeOpacity={0.9}
>
  <LinearGradient
    colors={[theme.accent, theme.accentSecondary]}
    locations={[0.55, 1]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.publicRoutinesGradient}
  >
    <View style={styles.publicRoutinesContent}>
      <View style={styles.publicRoutinesLeft}>
        <Text style={[styles.publicRoutinesTitle, { color: theme.cardText }]}>
          Browse Public Routines
        </Text>
        <Text style={[styles.publicRoutinesSubtitle, { color: theme.cardText }]}>
          Discover community workout programs
        </Text>
      </View>
      <TrendingUp size={28} color={theme.cardText} />
    </View>
  </LinearGradient>
</TouchableOpacity>
```

## Design Decisions

### 1. Gradient Background
- **Why:** Matches the existing design language used in routine cards throughout the app
- **Benefit:** Visual consistency, professional appearance

### 2. Prominent Placement
- **Why:** Placed before "My Routines" to give it high visibility
- **Benefit:** Encourages discovery of community content

### 3. Two Lines of Text
- **Why:** Clear call-to-action with context
- **Benefit:** Users immediately understand what they'll find

### 4. TrendingUp Icon
- **Why:** Suggests growth, community, and discovery
- **Benefit:** Visual interest, reinforces the "public/community" aspect

### 5. Shadow Effect
- **Why:** Creates depth and makes button "pop" from background
- **Benefit:** Draws attention, looks polished and modern

### 6. Full Width
- **Why:** Easy to tap (follows mobile UX best practices)
- **Benefit:** Accessibility, reduces missed taps

### 7. Haptic Feedback
- **Why:** Provides tactile confirmation of action
- **Benefit:** Better user experience, feels responsive

## Accessibility

- **Touch Target:** Large (full width, 80px+ height) - exceeds minimum 44x44px
- **Color Contrast:** High contrast white text on colored background
- **Clear Text:** Large, readable fonts (18px title, 13px subtitle)
- **Icon Support:** Icon reinforces text meaning
- **Haptic Feedback:** Confirms action for users

## Responsive Design

- **Mobile:** Full width with appropriate padding
- **Tablet:** Same design (consistent experience)
- **Landscape:** Adapts to screen width
- **Safe Area:** Respects device notches and insets

## Theme Support

The button automatically adapts to the app's theme:
- Uses `theme.accent` and `theme.accentSecondary` for gradient
- Uses `theme.cardText` for text and icon
- Maintains visual consistency across the app

## Testing Checklist

- [x] Button is visible on home screen
- [x] Gradient renders correctly
- [x] Shadow appears on both iOS and Android
- [x] Text is readable
- [x] Icon displays properly
- [x] Touch area is large enough
- [x] Haptic feedback works
- [x] Navigation triggers correctly
- [x] Active state (opacity change) is visible
- [x] Works in portrait orientation
- [x] Works in landscape orientation
- [x] Respects safe areas
- [x] Matches app theme colors

## Similar Patterns in App

This button design is consistent with:
- Routine cards (gradient background)
- Customize button (gradient with icon)
- Golden card (prominent call-to-action)

This creates a cohesive visual language throughout the app.

