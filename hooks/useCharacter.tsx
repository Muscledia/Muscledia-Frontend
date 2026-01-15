import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { StorageService } from '@/services/storageService';
import { GamificationService } from '@/services/gamificationService';

type Gender = 'male' | 'female';

type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  lastWorkout: string | null;
  gender: Gender;
  height?: number;
  weight?: number;
  goal?: string;
  // Health system
  maxHealth: number;
  currentHealth: number;
  lastHealthUpdate: string | null; // ISO timestamp for regen calculations
  // Daily routine limits
  routinesDate: string | null; // YYYY-MM-DD
  routinesDoneToday: string[]; // unique routine ids
  // Customization
  characterBackgroundUrl?: string | null;
  avatarUrl?: string | null;
  skinColor: 1 | 2 | 3;
  // Economy & Inventory
  coins: number;
  ownedShirts: string[];
  ownedPants: string[];
  ownedEquipment: string[];
  ownedAccessories: string[];
  ownedBackgrounds: string[]; // store URLs
  // Equipped
  equippedShirt?: string | null;
  equippedPants?: string | null;
  equippedEquipment?: string[];
  equippedAccessory?: string | null;
  // Derived stats
  baseStrength?: number;
  baseStamina?: number;
  baseAgility?: number;
  baseFocus?: number;
  baseLuck?: number;
};

type CharacterContextType = {
  character: Character;
  updateCharacter: (updatedCharacter: Partial<Character>) => void;
  incrementXP: (amount: number) => void;
  resetCharacter: () => void;
  // Health helpers
  applyHealthRegen: () => void;
  consumeHealth: (amount: number) => boolean;
  // Daily routine helpers
  canStartRoutineToday: (routineId: string) => boolean;
  registerRoutineStart: (routineId: string) => void;
  // Economy helpers
  addCoins: (amount: number) => void;
  purchaseItem: (category: 'Shirts'|'Pants'|'Equipment'|'Accessories'|'Backgrounds', itemName: string, price: number, url?: string) => boolean;
};

const DEFAULT_CHARACTER: Character = {
  name: 'Adventurer',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXP: 0,
  streak: 0,
  lastWorkout: null,
  gender: 'male',
  maxHealth: 50,
  currentHealth: 50,
  lastHealthUpdate: null,
  routinesDate: null,
  routinesDoneToday: [],
  characterBackgroundUrl: 'Garage',
  avatarUrl: null,
  skinColor: 1,
  coins: 0,
  ownedShirts: [],
  ownedPants: [],
  ownedEquipment: [],
  ownedAccessories: [],
  ownedBackgrounds: ['Garage'],
  equippedShirt: null,
  equippedPants: null,
  equippedEquipment: [],
  equippedAccessory: null,
  baseStrength: 10,
  baseStamina: 10,
  baseAgility: 10,
  baseFocus: 10,
  baseLuck: 10,
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load character data on initial render or user change
  useEffect(() => {
    const loadCharacter = async () => {
      if (!user?.username) {
        setIsInitialized(false);
        setCharacter(DEFAULT_CHARACTER);
        return;
      }

      try {
        const storedCharacter = await StorageService.getUserData(user.username);
        if (storedCharacter) {
          // Merge with defaults to ensure newly added fields exist
          const merged: Character = {
            ...DEFAULT_CHARACTER,
            ...storedCharacter,
          };
          // Normalize XP to next level
          if (!merged.xpToNextLevel || merged.xpToNextLevel <= 0) {
            merged.xpToNextLevel = calculateXPToNextLevel(merged.level || DEFAULT_CHARACTER.level);
          }
          // Normalize health bounds
          if (merged.maxHealth <= 0) merged.maxHealth = DEFAULT_CHARACTER.maxHealth;
          if (merged.currentHealth == null || merged.currentHealth < 0) merged.currentHealth = 0;
          if (merged.currentHealth > merged.maxHealth) merged.currentHealth = merged.maxHealth;
          // Ensure dates exist
          if (merged.lastHealthUpdate === undefined) merged.lastHealthUpdate = null;
          if (merged.routinesDate === undefined) merged.routinesDate = null;
          if (!Array.isArray(merged.routinesDoneToday)) merged.routinesDoneToday = [];
          if (merged.avatarUrl === undefined) merged.avatarUrl = null;
          if (typeof (merged as any).coins !== 'number') (merged as any).coins = 0;
          if (!Array.isArray((merged as any).ownedShirts)) (merged as any).ownedShirts = [];
          if (!Array.isArray((merged as any).ownedPants)) (merged as any).ownedPants = [];
          if (!Array.isArray((merged as any).ownedEquipment)) (merged as any).ownedEquipment = [];
          if (!Array.isArray((merged as any).ownedAccessories)) (merged as any).ownedAccessories = [];
          if (!Array.isArray((merged as any).ownedBackgrounds)) (merged as any).ownedBackgrounds = ['Garage'];
          if (!(merged as any).ownedBackgrounds.includes('Garage')) (merged as any).ownedBackgrounds.push('Garage');
          
          // Migrate equippedEquipment to array
          if (typeof (merged as any).equippedEquipment === 'string') {
            (merged as any).equippedEquipment = [(merged as any).equippedEquipment];
          } else if (!Array.isArray((merged as any).equippedEquipment)) {
             (merged as any).equippedEquipment = [];
          }

          if (!merged.skinColor) merged.skinColor = 1;
          if (!merged.characterBackgroundUrl) merged.characterBackgroundUrl = 'Garage';

          // Sync coins and XP from API
          try {
            const profile = await GamificationService.getProfile();
            if (profile) {
              (merged as any).coins = profile.fitnessCoins;
              (merged as any).totalXP = profile.points;
              (merged as any).level = profile.level;
              
              // Calculate relative XP for the bar based on the quadratic curve
              const currentLevel = profile.level;
              const levelBaseXP = currentLevel === 1 ? 0 : 40 * currentLevel * currentLevel;
              const nextLevelBaseXP = 40 * (currentLevel + 1) * (currentLevel + 1);
              
              const xpRequiredForLevel = nextLevelBaseXP - levelBaseXP;
              const xpProgressInLevel = Math.max(0, profile.points - levelBaseXP);
              
              (merged as any).xp = xpProgressInLevel;
              (merged as any).xpToNextLevel = xpRequiredForLevel;
            }
          } catch (error) {
            console.log('Failed to sync gamification profile:', error);
          }

          setCharacter(merged);
        } else {
          // New user (or local storage not present for this user)
          // We can initialize with defaults, but maybe check if user object has preferences?
          // For now, use defaults.
          let initialChar = { ...DEFAULT_CHARACTER };
          try {
            const profile = await GamificationService.getProfile();
            if (profile) {
              initialChar.coins = profile.fitnessCoins;
              initialChar.totalXP = profile.points;
              initialChar.level = profile.level;
              
              const currentLevel = profile.level;
              const levelBaseXP = currentLevel === 1 ? 0 : 40 * currentLevel * currentLevel;
              const nextLevelBaseXP = 40 * (currentLevel + 1) * (currentLevel + 1);
              
              initialChar.xp = Math.max(0, profile.points - levelBaseXP);
              initialChar.xpToNextLevel = nextLevelBaseXP - levelBaseXP;
            }
          } catch (error) {
            console.log('Failed to fetch initial profile:', error);
          }
          setCharacter(initialChar);
        }
      } catch (error) {
        console.error('Failed to load character data:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCharacter();
  }, [user]);

  // Health regeneration logic (called on init and whenever character loads)
  const applyHealthRegen = () => {
    // Logic disabled
  };

  // Ensure regen runs after init
  useEffect(() => {
    // Regen disabled
  }, [isInitialized]);

  // Update streak based on last workout date
  useEffect(() => {
    if (!isInitialized) return;

    const updateStreak = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastWorkout = character.lastWorkout;

      if (!lastWorkout) {
        return;
      }

      const lastWorkoutDate = new Date(lastWorkout);
      const currentDate = new Date(today);
      
      const timeDiff = currentDate.getTime() - lastWorkoutDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysDiff === 1) {
        updateCharacter({ 
          streak: character.streak + 1,
          lastWorkout: today
        });
      } else if (daysDiff > 1) {
        updateCharacter({ 
          streak: 0,
          lastWorkout: today
        });
      }
    };

    updateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // Save character data whenever it changes
  useEffect(() => {
    if (!isInitialized || !user?.username) return;

    const saveCharacter = async () => {
      try {
        await StorageService.saveUserData(user.username, character);
      } catch (error) {
        console.error('Failed to save character data:', error);
      }
    };

    saveCharacter();
  }, [character, isInitialized, user]);

  const calculateXPToNextLevel = (level: number) => {
    // Quadratic progression: Base XP ~ 40 * level^2
    // Delta = 40*(l+1)^2 - 40*l^2 = 80*l + 40
    // Special handling for Level 1 to start at 0
    if (level === 1) return 160; // 0 to 160
    return 80 * level + 40;
  };

  const checkLevelUp = (xp: number, currentLevel: number, currentXpToNextLevel: number) => {
    if (xp >= currentXpToNextLevel) {
      const newLevel = currentLevel + 1;
      const remainingXP = xp - currentXpToNextLevel;
      const newXpToNextLevel = calculateXPToNextLevel(newLevel);
      
      return {
        level: newLevel,
        xp: remainingXP,
        xpToNextLevel: newXpToNextLevel,
      };
    }
    
    return {
      level: currentLevel,
      xp: xp,
      xpToNextLevel: currentXpToNextLevel,
    };
  };

  const updateCharacter = (updatedCharacter: Partial<Character>) => {
    setCharacter(prevCharacter => ({
      ...prevCharacter,
      ...updatedCharacter,
    }));
  };

  const incrementXP = (amount: number) => {
    // Stat effects: strength increases XP gain; luck chance for double (handled probabilistically here too)
    const strength = (character.baseStrength || 10) + character.level * 2;
    const luck = (character.baseLuck || 10) + Math.floor(character.level / 2);
    let finalAmount = amount * (1 + strength * 0.005); // +0.5% per strength
    // luck: 10 luck = 0.5% chance double
    const luckDoubleChance = (luck / 10) * 0.005; // 0.05 per 100 luck
    if (Math.random() < luckDoubleChance) {
      finalAmount *= 2;
    }

    const newXP = character.xp + Math.round(finalAmount);
    const newTotalXP = character.totalXP + Math.round(finalAmount);
    
    const levelData = checkLevelUp(newXP, character.level, character.xpToNextLevel);
    
    updateCharacter({
      ...levelData,
      totalXP: newTotalXP,
    });
  };

  // Health helpers
  const consumeHealth = (amount: number) => {
    if (character.currentHealth <= 0) return false;
    // Stamina effect: more stamina increases cap and reduces consumption
    const stamina = (character.baseStamina || 10) + character.level * 3;
    const reducedCost = Math.max(1, Math.round(amount * (1 - Math.min(0.5, stamina * 0.005)))); // up to 50% reduction
    const maxBonus = Math.min(50, Math.floor(stamina * 0.5));
    const effectiveMax = (character.maxHealth || 50) + maxBonus;
    const remaining = Math.max(0, Math.min(effectiveMax, character.currentHealth - reducedCost));
    updateCharacter({ currentHealth: remaining });
    return remaining > 0;
  };

  // Daily routine helpers (disabled)
  const canStartRoutineToday = (_routineId: string) => {
    return true;
  };

  const registerRoutineStart = (_routineId: string) => {
    // no-op: feature disabled
  };

  const resetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
  };

  // Economy helpers
  const addCoins = (amount: number) => {
    updateCharacter({ coins: Math.max(0, (character.coins || 0) + amount) });
  };

  const purchaseItem = (category: 'Shirts'|'Pants'|'Equipment'|'Accessories'|'Backgrounds', itemName: string, price: number, url?: string) => {
    let success = false;
    
    setCharacter(prev => {
        const currentCoins = prev.coins || 0;
        if (currentCoins < price) {
            return prev;
        }
        
        success = true;
        const newCoins = currentCoins - price;
        const updates: Partial<Character> = { coins: newCoins };
        
        switch (category) {
          case 'Shirts':
            updates.ownedShirts = Array.from(new Set([...(prev.ownedShirts || []), itemName]));
            break;
          case 'Pants':
            updates.ownedPants = Array.from(new Set([...(prev.ownedPants || []), itemName]));
            break;
          case 'Equipment':
            updates.ownedEquipment = Array.from(new Set([...(prev.ownedEquipment || []), itemName]));
            break;
          case 'Accessories':
            updates.ownedAccessories = Array.from(new Set([...(prev.ownedAccessories || []), itemName]));
            break;
          case 'Backgrounds':
            if (url) {
                updates.ownedBackgrounds = Array.from(new Set([...(prev.ownedBackgrounds || []), url]));
                updates.characterBackgroundUrl = url;
            }
            break;
        }
        
        return { ...prev, ...updates };
    });
    
    return success;
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        updateCharacter,
        incrementXP,
        resetCharacter,
        applyHealthRegen,
        consumeHealth,
        canStartRoutineToday,
        registerRoutineStart,
        addCoins,
        purchaseItem,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
