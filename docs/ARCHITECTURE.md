# Muscledia Architecture & Developer Guide

This document explains how the app is structured, the purpose of each module, state flows, and how to extend it safely.

## Tech Stack
- React Native (Expo) + TypeScript
- Expo Router for navigation
- Context + custom hooks for state (`useCharacter`, `useRoutines`, etc.)
- AsyncStorage for persistence
- Expo Haptics & Notifications
- UI: StyleSheet + `expo-linear-gradient`
- Icons: `lucide-react-native`

## Backend API (for server developers)

For endpoints, contracts, and server-side domain rules, see `docs/BACKEND_API.md`.

## High-level Structure
- `app/` (Expo Router screens)
  - `(auth)/` login/register stack
  - `(tabs)/` bottom-tabbed app (Home, Quests, Shop, Arena)
  - `customize.tsx` (character customization)
  - `leagues.tsx` (leagues detail)
  - `onboarding.tsx` (first-run slides)
  - `_layout.tsx` (root providers & stacks)
- `components/` shared UI (avatar, progress bar, stats)
- `hooks/` global state hooks and providers
- `constants/Colors.ts` theme tokens & gradients
- `utils/` helpers

## Routing
- Expo Router drives routes by file name. Key entries:
  - `app/_layout.tsx`: wraps the tree with providers and defines top-level stacks.
  - `app/(auth)/_layout.tsx`: mini stack for login/register.
  - `app/(tabs)/_layout.tsx`: tabs config and the floating center FAB.
  - `app/index.tsx`: app entry; redirects to onboarding or auth/tabs.

## Theming
- `constants/Colors.ts` contains dark/light color scales and helpers.
- Use `useColorScheme()` and `getThemeColors(isDark)` to retrieve current palette.
- Gradients use `[theme.accent, theme.accentSecondary]` and `locations={[0.55, 1]}` for yellow-forward look.

## Global Providers (app/_layout.tsx)
Providers must be mounted here to be available everywhere:
- `AuthProvider`: authentication state and helpers
- `WorkoutsProvider`, `RoutineProvider`: workouts and routines data
- `CharacterProvider`: player progression, health, inventory, economy
- `RaidProvider`: weekly “Muscle Champions” target
- `LeaguesProvider`: monthly divisions and rewards
- `NotificationsProvider`: permissions and scheduling

## Hooks

### useCharacter.tsx
Central player state, persisted via AsyncStorage.
- Core fields: level/xp, streak, health (`maxHealth`, `currentHealth`), daily routine limits.
- Customization: `characterBackgroundUrl`, `avatarUrl`.
- Economy: `coins` and owned items (`ownedShirts`, `ownedPants`, `ownedEquipment`, `ownedBackgrounds`), equipped slots (`equippedShirt`, `equippedPants`, `equippedEquipment`).
- Base stats: `baseStrength`, `baseStamina`, `baseAgility`, `baseFocus`, `baseLuck` (grow with level/equipment; see effects below).
- Helpers:
  - `updateCharacter(partial)`: immutable update + persist
  - `incrementXP(amount)`: applies Strength and Luck effects
  - `completeQuest(id, xp)`
  - `applyHealthRegen()`: time-based health regen
  - `consumeHealth(cost)`: applies Stamina effects (reduced cost and cap bonus)
  - `canStartRoutineToday`, `registerRoutineStart`: 3-unique-routines-per-day
  - Economy: `addCoins(amount)`, `purchaseItem(category, name, price, url?)`
  - Equip: `equipItem(category, name)` (simple modifiers; extend as needed)

Stat effects (current pass):
- Strength: increases XP from `incrementXP` (+0.5% per point)
- Luck: small double-XP chance (10 Luck ≈ 0.5%); applied inside `incrementXP`
- Stamina: reduces health consumption up to 50% and adds cap bonus inside `consumeHealth`
- Agility/Focus: placeholders; wire into Leagues and stamina-free chance (see “Extending Effects”).

### useRoutines.tsx
- Routines CRUD + `markSetCompleted` for set-level completion.
- Used by routine builder and routine workout screen.

### useRaid.tsx
- Weekly solo challenge (Muscle Champions): target of 60 sets → 500 XP.
- `contributeSets(n)` increments progress.

### useLeagues.tsx
- Tracks monthly divisions (Bronze → Challenger) by points.
- Points accrue 1 per completed set.
- Automatic monthly reset, reward carryover, and claim.
- Exposes: `state`, `currentDivision`, `nextDivision`, `addPoints`, `claimPendingReward`.

### useNotifications.tsx
- Requests permissions and schedules notifications.
- `scheduleDailyReminder(hour, minute)` & `scheduleInSeconds(seconds, title, body)`.

### useHaptics.ts
- `impact(style)` helper wrapping Expo Haptics.

## Key Screens

### Home (app/(tabs)/index.tsx)
- Shows character with background and the “Customize” button.
- Health and XP bars reflect `useCharacter`.
- Routines list; tap to start routine workout.
- Background image respects `character.characterBackgroundUrl`.

### Customize (app/customize.tsx)
- Safe-area aware header.
- Backgrounds grid (preset demos). Tap to set `characterBackgroundUrl`.
- Owned items (Shirts, Pants, Equipment) listed as tags; tap to equip (updates `equipped*`).
- Future: display thumbnails and stats modifiers per item.

### Shop (app/(tabs)/shop.tsx)
- Shows categories: Shirts, Pants, Equipment, Backgrounds.
- Header shows current coin balance + a “+500” button for dev/testing.
- Purchasing deducts coins and stores ownership; backgrounds also apply immediately.
- Owned items display “Owned”.

### Routine Builder (app/routine-builder.tsx)
- Categories, search, and add exercises; defaults to 1 set.
- Save prompts for a name; persists via `useRoutines`.

### Routine Workout (app/routine-workout/[planId].tsx)
- Execute routines; toggle edit mode for sets.
- Per-set completion with checkmark; awards XP, contributes to raid, and to leagues points.
- Enforces health and daily routine limit; calls `consumeHealth` and regeneration.
- Hooks for stat effects already applied in `useCharacter` (XP and stamina). You can extend effects here if needed.

### Leagues (app/leagues.tsx)
- Shows monthly division, points, progress, days to reset, and reward claim.
- Accessed via Profile card; not in navbar.

### Profile (app/profile.tsx)
- Gradient character card: avatar (tap to change via ImagePicker), health/xp bars, username.
- Leagues card with progress and claim.
- Outfits list and an “Equipped” summary.
- Settings include: notifications test, daily reminder, reset onboarding, logout.

### Onboarding (app/onboarding.tsx)
- First-run 4 slides with full-screen gradient.
- Stored flag `onboarding_complete` in AsyncStorage.
- Reset via Profile → Reset Onboarding.

## Visual Components
- `CharacterAvatar.tsx`: displays avatar with optional override; handles flame/streak effect.
- `ProgressBar.tsx`: themed progress bar; pass `progress` 0..1 and an optional color.
- `StatsCard.tsx`: small stat display; supports golden variant.

## Data & Persistence
- All major state hooks persist to AsyncStorage.
- When adding fields, always merge with defaults at load time to preserve backward compatibility (see `useCharacter` load merging).

## Haptics
- Use `useHaptics().impact('light'|'medium'|'heavy'|'success'|'warning'|'error'|'selection')` on key interactions.

## Notifications
- `NotificationsProvider` sets a handler and exposes scheduling helpers.
- iOS requires permission; Android sets a default channel.

## Extending Stat Effects
- Agility → affect Leagues point boosts or progress thresholds.
- Focus → chance to avoid stamina cost and small chance for 1.5x XP on set completion.
- Implement in `routine-workout/[planId].tsx` around the set completion logic (e.g., before calling `consumeHealth` or `incrementXP`).

## Adding New Inventory/Equipment
1. Define new items in Shop or a central catalog.
2. On purchase, store in ownership arrays via `purchaseItem`.
3. Display in Customize and allow equipping (update `equipped*`).
4. Apply stat modifiers in `equipItem` and/or when calculating derived stats.

## Common Flows
- Complete a set:
  1. `RoutineWorkout` toggles set → if completing, calls `consumeHealth` (stamina rules)
  2. Calls `markSetCompleted` in `useRoutines`
  3. Awards XP via `incrementXP` (strength/luck applied)
  4. Leagues `addPoints(1)` and Raid `contributeSets(1)`

- Change background:
  - From Shop (purchase background) or Customize (choose preset/owned). Updates `character.characterBackgroundUrl`.

- Notifications:
  - Profile → “Test Notification” (3s) or “Enable Daily Reminder (9:00)”.

## Coding Standards
- Use the theme object instead of raw color literals.
- Keep providers ordered in `app/_layout.tsx`.
- Keep business logic inside hooks rather than components.
- Avoid inline comments inside code; rely on clear naming and this document.

## Known Todos / Future Work
- Richer outfit system with thumbnails & stat cards.
- Agility/Focus effects wired into leagues and routine flow.
- Better economy (earn coins via quests/workouts).
- Remote sync (supabase or backend) if needed.

