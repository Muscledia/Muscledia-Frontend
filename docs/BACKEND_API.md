# Muscledia Backend API Specification

This document defines the backend interfaces needed by the Muscledia app. It is backend-agnostic (can be implemented with Node/Express, NestJS, Django, Go, etc.) and designed for JWT-based authentication. All responses are JSON. Times are ISO-8601 UTC.

Base URL: https://api.muscledia.example.com
Versioning: Prefix with /v1
Auth: Bearer <JWT>

## Conventions
- Pagination: `?page=1&limit=20` returns `{ data: T[], page, limit, total }`
- Errors: HTTP status codes + body `{ error: { code: string, message: string, details?: any } }`
- Idempotency for writes: optional `Idempotency-Key` header

## Authentication

POST /v1/auth/register
- Body: { email, password, username }
- 201 -> { user: User, tokens: AuthTokens }

POST /v1/auth/login
- Body: { email, password }
- 200 -> { user: User, tokens: AuthTokens }

POST /v1/auth/refresh
- Body: { refreshToken }
- 200 -> { tokens: AuthTokens }

GET /v1/auth/me
- Auth required
- 200 -> { user: User }

Types:
- User { id, email, username, createdAt, lastLoginAt }
- AuthTokens { accessToken, refreshToken, expiresIn }

## Character

GET /v1/character
- 200 -> Character

PATCH /v1/character
- Body: Partial<CharacterUpdate>
- 200 -> Character

POST /v1/character/avatar
- Body: { imageUrl }
- 200 -> Character

POST /v1/character/background
- Body: { imageUrl }
- 200 -> Character

POST /v1/character/coins/grant
- Admin/Dev only
- Body: { amount }
- 200 -> { coins }

Types:
- Character {
  id, userId,
  level, xp, streak,
  maxHealth, currentHealth, lastHealthUpdate,
  routinesDate, routinesDoneToday,
  coins,
  avatarUrl, characterBackgroundUrl,
  baseStrength, baseStamina, baseAgility, baseFocus, baseLuck,
  equipped: { shirt?: string, pants?: string, equipment?: string },
  owned: { shirts: string[], pants: string[], equipment: string[], backgrounds: string[] },
  updatedAt
}
- CharacterUpdate: fields allowed to change client-side (avatarUrl, characterBackgroundUrl, equipped, etc.). XP/level/health should also be allowed via domain endpoints below.

## Routines

GET /v1/routines
- 200 -> { data: Routine[], page, limit, total }

POST /v1/routines
- Body: { name, exercises: ExerciseSetInput[] }
- 201 -> Routine

GET /v1/routines/:id
- 200 -> Routine

PATCH /v1/routines/:id
- Body: Partial<{ name, exercises: ExerciseSetInput[] }>
- 200 -> Routine

DELETE /v1/routines/:id
- 204

POST /v1/routines/:id/complete-set
- Body: { exerciseId, setIndex }
- 200 -> { routine: Routine, rewards: { xpGained, coinsGained?, leaguePoints: number, raidProgress: RaidState } }

Types:
- Routine { id, userId, name, exercises: RoutineExercise[], createdAt, updatedAt }
- RoutineExercise { id, name, category, sets: SetDef[] }
- SetDef { weight: number, reps: number, completed: boolean }
- ExerciseSetInput { exerciseId|name, category, sets?: SetDef[] }

## Quests

GET /v1/quests
- 200 -> { daily: Quest[], weekly: Quest[], special: Quest[] }

POST /v1/quests/:id/complete
- 200 -> { quest: Quest, rewards: { xpGained, coinsGained? } }

Types:
- Quest { id, type: 'daily'|'weekly'|'special', title, xp, active: boolean, completed: boolean }

## Shop & Inventory

GET /v1/shop/catalog
- 200 -> { shirts: Item[], pants: Item[], equipment: Item[], backgrounds: Item[] }

POST /v1/shop/purchase
- Body: { itemId }
- 200 -> { owned: Ownership, coins }
- 402 -> insufficient coins

POST /v1/inventory/equip
- Body: { slot: 'shirt'|'pants'|'equipment', itemId }
- 200 -> Character

Types:
- Item { id, name, price, slot?: 'shirt'|'pants'|'equipment', imageUrl?, modifiers?: StatMods }
- Ownership { shirts: string[], pants: string[], equipment: string[], backgrounds: string[] }
- StatMods { strength?: number, stamina?: number, agility?: number, focus?: number, luck?: number }

## Leagues

GET /v1/leagues/state
- 200 -> { division, points, resetAt, pendingReward?: Reward }

POST /v1/leagues/add-points
- Body: { points }
- 200 -> { division, points }

POST /v1/leagues/claim-reward
- 200 -> { claimed: Reward }

Types:
- Reward { type: 'xp'|'coins'|'item', amount?: number, itemId?: string }

## Raid (Muscle Champions)

GET /v1/raid/state
- 200 -> RaidState

POST /v1/raid/contribute
- Body: { sets }
- 200 -> RaidState

Types:
- RaidState { targetSets: number, currentSets: number, resetAt, reward: Reward }

## Notifications

POST /v1/notifications/register-device
- Body: { deviceToken, platform }
- 200 -> { ok: true }

POST /v1/notifications/schedule-daily
- Body: { hour, minute }
- 200 -> { ok: true }

## Server-side Domain Logic Guidance

- XP/Leveling: implement in a service that receives events (set completed, quest completed). Apply Strength/Luck modifiers server-side for source-of-truth consistency.
- Health/Stamina: on set completion, compute health cost using Stamina and Focus effects; clamp to maxHealth.
- Daily Routine Limit: enforce 3 unique routines per day per user; store `routinesDate` and `routinesDoneToday`.
- Leagues: 1 point per completed set minimum; optional boosts from Agility; monthly reset with carryover rewards.
- Raid: per-user weekly target (60 sets → 500 XP); reset weekly.
- Economy: atomic purchases; deduct coins and grant ownership in a transaction.

## Security & Rate Limits
- Use JWT with short-lived access and refresh tokens.
- Rate limit auth endpoints and purchase endpoints.
- Validate all identifiers belong to the authenticated user (multi-tenant safety).

## Webhooks / Events (optional)
- `workout.set.completed`: { userId, routineId, exerciseId, setIndex }
- `quest.completed`: { userId, questId }
- `purchase.completed`: { userId, itemId }

## Example Sequence: Complete a Set
1) Client: POST /v1/routines/:id/complete-set { exerciseId, setIndex }
2) Server:
   - Validate ownership and edit window
   - Apply stamina/focus to compute health cost; regen if needed
   - Mark set completed
   - Compute XP with strength/luck; update level if needed
   - Add 1 league point; contribute 1 raid set
   - Persist all in a transaction
3) Response: routine + rewards bundle
