import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

type Gender = 'male' | 'female';

type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  lastWorkout: string | null;
  questsCompleted: number;
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
  // Economy & Inventory
  coins: number;
  ownedShirts: string[];
  ownedPants: string[];
  ownedEquipment: string[];
  ownedBackgrounds: string[]; // store URLs
  // Equipped
  equippedShirt?: string | null;
  equippedPants?: string | null;
  equippedEquipment?: string | null;
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
  completeQuest: (questId: string, xpReward: number) => void;
  resetCharacter: () => void;
  // Health helpers
  applyHealthRegen: () => void;
  consumeHealth: (amount: number) => boolean;
  // Daily routine helpers
  canStartRoutineToday: (routineId: string) => boolean;
  registerRoutineStart: (routineId: string) => void;
  // Economy helpers
  addCoins: (amount: number) => void;
  purchaseItem: (category: 'Shirts'|'Pants'|'Equipment'|'Backgrounds', itemName: string, price: number, url?: string) => boolean;
};

const DEFAULT_CHARACTER: Character = {
  name: 'Adventurer',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXP: 0,
  streak: 0,
  lastWorkout: null,
  questsCompleted: 0,
  gender: 'male',
  maxHealth: 50,
  currentHealth: 50,
  lastHealthUpdate: null,
  routinesDate: null,
  routinesDoneToday: [],
  characterBackgroundUrl: null,
  avatarUrl: null,
  coins: 0,
  ownedShirts: [],
  ownedPants: [],
  ownedEquipment: [],
  ownedBackgrounds: [],
  equippedShirt: null,
  equippedPants: null,
  equippedEquipment: null,
  baseStrength: 10,
  baseStamina: 10,
  baseAgility: 10,
  baseFocus: 10,
  baseLuck: 10,
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load character data on initial render
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const storedCharacter = await AsyncStorage.getItem('character');
        if (storedCharacter) {
          const parsed = JSON.parse(storedCharacter);
          // Merge with defaults to ensure newly added fields exist
          const merged: Character = {
            ...DEFAULT_CHARACTER,
            ...parsed,
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
          if (!Array.isArray((merged as any).ownedBackgrounds)) (merged as any).ownedBackgrounds = [];

          setCharacter(merged);
        }
      } catch (error) {
        console.error('Failed to load character data:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCharacter();
  }, []);

  // Health regeneration logic (called on init and whenever character loads)
  const applyHealthRegen = () => {
    const now = new Date();
    const nowIso = now.toISOString();

    // If no last update recorded, set it and return
    if (!character.lastHealthUpdate) {
      updateCharacter({ lastHealthUpdate: nowIso });
      return;
    }

    // Calculate minutes passed
    const last = new Date(character.lastHealthUpdate);
    const minutes = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));

    if (minutes <= 0 || character.currentHealth >= character.maxHealth) {
      // Still update timestamp if missing
      if (!character.lastHealthUpdate) updateCharacter({ lastHealthUpdate: nowIso });
      return;
    }

    // Regeneration rate: 1 health per 30 minutes
    const regenUnits = Math.floor(minutes / 30);
    if (regenUnits > 0) {
      const newHealth = Math.min(character.maxHealth, character.currentHealth + regenUnits);
      updateCharacter({ currentHealth: newHealth, lastHealthUpdate: nowIso });
    } else {
      // No whole unit passed, still update timestamp to avoid extremely fast loops
      updateCharacter({ lastHealthUpdate: nowIso });
    }
  };

  // Ensure regen runs after init
  useEffect(() => {
    if (!isInitialized) return;
    applyHealthRegen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!isInitialized) return;

    const saveCharacter = async () => {
      try {
        await AsyncStorage.setItem('character', JSON.stringify(character));
      } catch (error) {
        console.error('Failed to save character data:', error);
      }
    };

    saveCharacter();
  }, [character, isInitialized]);

  const calculateXPToNextLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
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

  const completeQuest = (questId: string, xpReward: number) => {
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = character.lastWorkout;
    
    let newStreak = character.streak;
    
    if (lastWorkout !== today) {
      if (!lastWorkout) {
        newStreak = 1;
      } else {
        const lastWorkoutDate = new Date(lastWorkout);
        const currentDate = new Date(today);
        
        const timeDiff = currentDate.getTime() - lastWorkoutDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      }
    }
    
    incrementXP(xpReward);
    updateCharacter({
      questsCompleted: character.questsCompleted + 1,
      lastWorkout: today,
      streak: newStreak,
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

  const equipItem = (category: 'Shirts'|'Pants'|'Equipment', name: string) => {
    const updates: Partial<Character> = {};
    if (category === 'Shirts') updates.equippedShirt = name;
    if (category === 'Pants') updates.equippedPants = name;
    if (category === 'Equipment') updates.equippedEquipment = name;
    // Apply simple stat modifiers for demo purposes
    let bs = character.baseStrength || 10;
    let bst = character.baseStamina || 10;
    let bag = character.baseAgility || 10;
    let bf = character.baseFocus || 10;
    let bl = character.baseLuck || 10;
    // naive mapping
    if (category === 'Equipment') { bs += 5; }
    if (category === 'Shirts') { bag += 3; }
    if (category === 'Pants') { bst += 3; }
    updates.baseStrength = bs; updates.baseStamina = bst; updates.baseAgility = bag; updates.baseFocus = bf; updates.baseLuck = bl;
    updateCharacter(updates);
  };

  const resetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
  };

  // Economy helpers
  const addCoins = (amount: number) => {
    updateCharacter({ coins: Math.max(0, (character.coins || 0) + amount) });
  };

  const purchaseItem = (category: 'Shirts'|'Pants'|'Equipment'|'Backgrounds', itemName: string, price: number, url?: string) => {
    const currentCoins = character.coins || 0;
    if (currentCoins < price) return false;
    const newCoins = currentCoins - price;
    const updates: Partial<Character> = { coins: newCoins };
    switch (category) {
      case 'Shirts':
        updates.ownedShirts = Array.from(new Set([...(character.ownedShirts || []), itemName]));
        break;
      case 'Pants':
        updates.ownedPants = Array.from(new Set([...(character.ownedPants || []), itemName]));
        break;
      case 'Equipment':
        updates.ownedEquipment = Array.from(new Set([...(character.ownedEquipment || []), itemName]));
        break;
      case 'Backgrounds':
        if (url) updates.ownedBackgrounds = Array.from(new Set([...(character.ownedBackgrounds || []), url]));
        if (url) updates.characterBackgroundUrl = url;
        break;
    }
    updateCharacter(updates);
    return true;
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        updateCharacter,
        incrementXP,
        completeQuest,
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