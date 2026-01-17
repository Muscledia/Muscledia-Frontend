# Gamification Systems Breakdown
## Core Mechanics & Implementation

---

## 1. Points and Level-Up System

### Core Mechanics

**XP Award per Workout:**
```
Base XP: 50 points (guaranteed)

Duration Bonuses:
- 30-44 minutes: +15 XP → 65 total
- 45-59 minutes: +25 XP → 75 total
- 60+ minutes:   +30 XP → 80 total

Badge Bonuses:
- Variable: 15-200 XP depending on achievement
```

### Level Calculation

**Formula:**
```java
level = ⌊√(totalPoints / 50)⌋ + 1
```

**Key Thresholds:**
```
Level 1:  0 points (starting point)
Level 5:  800 points (~12 workouts, 3 weeks)
Level 10: 4,050 points (~60 workouts, 3 months)
Level 20: 18,050 points (~270 workouts, 6 months)
Level 50: 120,050 points (~1,800 workouts, 2+ years)
```

### Implementation Flow
```
1. Workout completes
   ↓
2. WorkoutEventHandler.calculateXPPoints()
   - Base: 50 XP
   - Check duration for bonus
   - Return total XP
   ↓
3. UserGamificationService.updateUserPoints(userId, xp)
   ↓
4. ProfileUpdateService.updatePoints()
   - Get old level from current points
   - Add new XP to total
   - Calculate new level using formula
   - Check if (newLevel > oldLevel)
   ↓
5. If level-up detected:
   - Update profile with new level
   - Set lastLevelUpDate
   - Return LevelUpResult(true, oldLevel, newLevel)
   ↓
6. Log celebration if level-up occurred
```

### Data Updates

**Profile Changes:**
```
Before workout:
- points: 2,750
- level: 7

After 65-minute workout:
- points: 2,830 (+80 XP)
- level: 8 (LEVEL UP!)
- lastLevelUpDate: now()
```

### Purpose

- Immediate feedback: Every workout awards XP
- Visible progress: Level number shows achievement
- Long-term engagement: Infinite progression possible
- Balanced difficulty: Square root prevents exponential grind

---

## 2. Fitness Coins System

### Core Mechanics

**Earning Formula:**
```java
base = 10 coins

durationBonus = min(durationMinutes / 5, 12)
// 1 coin per 5 minutes, capped at 12 coins

prBonus = min(personalRecords × 5, 25)
// 5 coins per PR, capped at 25 coins

streakBonus = min(currentStreak, 30)
// 1 coin per streak day, capped at 30 coins

totalCoins = base + durationBonus + prBonus + streakBonus
```

**Maximum per Workout:** 77 coins (10+12+25+30)

### Example Calculation

**Workout Details:**
```
Duration: 65 minutes
Personal Records: 2
Current Streak: 5 days
```

**Coin Breakdown:**
```
Base:              10 coins
Duration bonus:    13 coins (65÷5 = 13)
PR bonus:          10 coins (2×5 = 10)
Streak bonus:       5 coins (5-day streak)
───────────────────────────
Total earned:      38 coins
```

### Implementation Flow
```
1. Workout completes
   ↓
2. WorkoutEventHandler calls:
   FitnessCoinsService.awardWorkoutCoins(
     userId, 
     durationMinutes, 
     personalRecordsAchieved, 
     currentStreak
   )
   ↓
3. Calculate coins using formula
   ↓
4. Get user profile from repository
   ↓
5. Update balances:
   - currentBalance += coinsEarned
   - lifetimeTotal += coinsEarned
   ↓
6. Save profile
   ↓
7. Return CoinReward object with breakdown
```

### Profile Tracking

**Two Fields:**
```json
{
  "fitnessCoins": 245,        // Current spendable balance
  "lifetimeCoinsEarned": 1450 // Total ever earned (never decreases)
}
```

**After Earning 38 Coins:**
```json
{
  "fitnessCoins": 283,        // 245 + 38
  "lifetimeCoinsEarned": 1488 // 1450 + 38
}
```

### Spending Mechanism

**Method:**
```java
boolean spendCoins(Long userId, int amount, String itemId)
```

**Process:**
```
1. Get user profile
2. Check if currentBalance >= amount
3. If yes:
   - Deduct from fitnessCoins
   - Save profile
   - Log purchase
   - Return true
4. If no:
   - Log insufficient balance
   - Return false
```

**Note:** `lifetimeCoinsEarned` never decreases when spending

### Purpose

- Clear earning rules: Users know exactly how to earn
- Immediate reward: Coins awarded with XP
- Virtual economy: Enables future marketplace
- Engagement metric: Lifetime total shows overall activity

---

## 3. Badge Achievement System

### Core Mechanics

**Achievement Categories:**

**1. Workout Count Milestones:**
```
First Workout (1)      → +25 XP
Getting Started (5)    → +25 XP
Committed (10)         → +50 XP
Dedicated (25)         → +75 XP
Fitness Enthusiast (50) → +100 XP
Fitness Warrior (100)  → +200 XP
```

**2. Streak Achievements:**
```
Building Momentum (3 days)   → +15 XP
Week Warrior (7 days)        → +35 XP
Two Week Champion (14 days)  → +75 XP
Monthly Master (30 days)     → +150 XP
```

**3. Duration Achievements:**
```
Hour Warrior (60+ min)       → +30 XP
Endurance Master (90+ min)   → +50 XP
```

**4. Volume Achievements:**
```
Volume Crusher (20+ sets)    → +20 XP
Rep Master (200+ reps)       → +30 XP
```

### Implementation Flow
```
1. Workout completes
   ↓
2. AchievementService.processWorkoutAchievements(event)
   ↓
3. Get user profile
   ↓
4. Calculate current workout count
   ↓
5. Check all achievement categories:
   
   checkFirstWorkoutAchievement(profile, count)
   ↓
   checkWorkoutMilestones(profile, count)
   ↓
   checkStreakAchievements(profile, event)
   ↓
   checkDurationAchievements(profile, event)
   ↓
   checkVolumeAchievements(profile, event)
   ↓
6. For each eligible achievement:
   awardBadge(profile, badgeId, name, description, bonusPoints)
   ↓
7. Save updated profile
```

### Badge Award Process

**Method:**
```java
private void awardBadge(
  UserGamificationProfile profile, 
  String badgeId,
  String badgeName, 
  String description, 
  int bonusPoints
)
```

**Steps:**
```
1. Check if user already has this badge
   - Search profile.earnedBadges for matching badgeId
   ↓
2. If not already earned:
   a. Create UserBadge object:
      - badgeId: "STREAK_7"
      - badgeName: "Week Warrior"
      - description: "One week streak!"
      - category: "WORKOUT"
      - pointsAwarded: 35
      - earnedAt: now()
   
   b. Add badge to profile.earnedBadges list
   
   c. Award bonus points:
      RewardProcessor.awardPoints(userId, bonusPoints)
      - Delegates to UserGamificationService
      - Triggers level-up check
   
   d. Log achievement
   ↓
3. If already earned:
   - Skip (badges are one-time awards)
```

### Badge Storage

**UserBadge Structure:**
```java
@Data
@Builder
public class UserBadge {
    private String badgeId;           // "STREAK_7"
    private String badgeName;         // "Week Warrior"
    private String description;       // "One week streak!"
    private String category;          // "WORKOUT"
    private Integer pointsAwarded;    // 35
    private Instant earnedAt;         // Timestamp
}
```

**In Profile:**
```json
{
  "earnedBadges": [
    {
      "badgeId": "FIRST_WORKOUT",
      "badgeName": "First Steps",
      "pointsAwarded": 25,
      "earnedAt": "2026-01-05T10:30:00Z"
    },
    {
      "badgeId": "STREAK_7",
      "badgeName": "Week Warrior",
      "pointsAwarded": 35,
      "earnedAt": "2026-01-12T14:20:00Z"
    }
  ]
}
```

### Duplicate Prevention

**Check Logic:**
```java
boolean alreadyHas = profile.getEarnedBadges()
    .stream()
    .anyMatch(badge -> badgeId.equals(badge.getBadgeId()));

if (!alreadyHas) {
    // Award badge
}
```

### Purpose

- Milestone recognition: Celebrate user progress
- Bonus rewards: Extra XP accelerates leveling
- Achievement variety: Multiple paths to success
- Collection mechanic: Completionist psychology

---

## Integration Summary

### Single Workout Flow

**Example: 65-minute workout with 2 PRs, 7-day streak**
```
Step 1: XP System
- Base XP: 50
- Duration bonus: +30
- Total: 80 XP awarded
- Level check: 7 → 8 (LEVEL UP!)

Step 2: Coins System
- Base: 10 coins
- Duration: +13 coins
- PRs: +10 coins
- Streak: +7 coins
- Total: 40 coins awarded

Step 3: Badge System
- Check workout count: If milestone, award badge
- Check streak: 7 days → "Week Warrior" (+35 XP bonus)
- Check duration: 65 min → "Hour Warrior" (+30 XP bonus)
- Total badges: 2 unlocked

Final State Changes:
- Points: 2,750 → 2,895 (+145 total: 80 workout + 65 badges)
- Level: 7 → 8
- Coins: 245 → 285 (+40)
- Badges: +2 new achievements
```

### Key Design Principles

**Separation:**
- Each system operates independently
- All called from same handler (orchestration)
- Failures isolated (one system failing doesn't break others)

**Transparency:**
- Clear formulas for all calculations
- Users know exactly how to earn rewards
- No hidden mechanics or black boxes

**Immediate Feedback:**
- All rewards processed synchronously
- User sees results instantly after workout
- No delayed or batch processing

**Progressive Difficulty:**
- XP: Square root curve balances early/late game
- Coins: Capped bonuses prevent inflation
- Badges: Increasing rarity with higher milestones

This three-system approach creates a comprehensive engagement loop that rewards users through multiple mechanics simultaneously.
