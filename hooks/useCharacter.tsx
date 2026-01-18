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
};

type CharacterContextType = {
  character: Character;
  updateCharacter: (updatedCharacter: Partial<Character>) => void;
  refreshCharacter: () => Promise<void>;
  incrementXP: (amount: number) => void;
  resetCharacter: () => void;
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
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load character data on initial render or user change
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
        // Ensure dates exist
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
          const profile = await GamificationService.getProfile(true); // Force refresh
          if (profile) {
            (merged as any).coins = profile.fitnessCoins;
            (merged as any).totalXP = profile.points;
            (merged as any).level = profile.level;
            
            // Calculate relative XP for the bar based on the quadratic curve
            // Backend Formula: level = floor(sqrt(totalPoints / 100)) + 1
            // Inverse: Min Points for Level L = 100 * (L-1)^2
            // NOTE: If the backend returns a level that doesn't match points (due to lag or logic diff),
            // we should trust the points and recalculate the correct level to ensure bar accuracy.
            
            const points = profile.points;
            const calculatedLevel = Math.floor(Math.sqrt(points / 100)) + 1;
            
            // Use calculated level if it's higher than backend level (prevent regression if backend is behind)
            // Or just use calculated level to be safe and consistent with formula.
            const currentLevel = Math.max(profile.level, calculatedLevel);
            
            const levelBaseXP = 100 * (currentLevel - 1) * (currentLevel - 1);
            const nextLevelBaseXP = 100 * currentLevel * currentLevel;
            
            const xpRequiredForLevel = nextLevelBaseXP - levelBaseXP;
            const xpProgressInLevel = Math.max(0, points - levelBaseXP);
            
            (merged as any).level = currentLevel;
            (merged as any).xp = xpProgressInLevel;
            (merged as any).xpToNextLevel = xpRequiredForLevel;
          }
        } catch (error) {
          console.log('Failed to sync gamification profile:', error);
        }

        setCharacter(merged);
      } else {
        // New user (or local storage not present for this user)
        // We can initialize with defaults but also maybe we can check if user object has preferences? idk
        // or now, use defaults. 
        let initialChar = { ...DEFAULT_CHARACTER };
        try {
          const profile = await GamificationService.getProfile(true); // Force refresh
          if (profile) {
            initialChar.coins = profile.fitnessCoins;
            initialChar.totalXP = profile.points;
            initialChar.level = profile.level;
            
            const points = profile.points;
            const calculatedLevel = Math.floor(Math.sqrt(points / 100)) + 1;
            const currentLevel = Math.max(profile.level, calculatedLevel);
            
            const levelBaseXP = 100 * (currentLevel - 1) * (currentLevel - 1);
            const nextLevelBaseXP = 100 * currentLevel * currentLevel;
            
            initialChar.level = currentLevel;
            initialChar.xp = Math.max(0, points - levelBaseXP);
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

  useEffect(() => {
    loadCharacter();
  }, [user]);

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
    // Formula: level = floor(sqrt(totalPoints / 100)) + 1
    // Inverse: Min Points for Level L = 100 * (L-1)^2
    // Next Level (L+1) Start = 100 * L^2
    // Delta = 100*L^2 - 100*(L-1)^2 = 100*L^2 - 100*(L^2 - 2L + 1) = 200*L - 100
    return 200 * level - 100;
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
    const finalAmount = amount;
    
    const newXP = character.xp + Math.round(finalAmount);
    const newTotalXP = character.totalXP + Math.round(finalAmount);
    
    const levelData = checkLevelUp(newXP, character.level, character.xpToNextLevel);
    
    updateCharacter({
      ...levelData,
      totalXP: newTotalXP,
    });
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
        refreshCharacter: loadCharacter,
        incrementXP,
        resetCharacter,
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
