import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
  async saveUserData(username: string, data: any) {
    try {
      const key = `user_${username}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  },

  async getUserData(username: string) {
    try {
      const key = `user_${username}`;
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      throw error;
    }
  },

  async clearUserData(username: string) {
    try {
      const key = `user_${username}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw error;
    }
  },
};

