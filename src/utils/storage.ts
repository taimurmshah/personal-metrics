import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'AUTH_TOKEN';

/**
 * Saves the authentication token to secure storage.
 * @param token The authentication token string.
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'Failed to save token to AsyncStorage',
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        tokenKey: TOKEN_KEY,
      })
    );
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Retrieves the authentication token from secure storage.
 * @returns A promise that resolves with the token string if found, or null otherwise.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'Failed to retrieve token from AsyncStorage',
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        tokenKey: TOKEN_KEY,
      })
    );
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Removes the authentication token from secure storage.
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'Failed to remove token from AsyncStorage',
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        tokenKey: TOKEN_KEY,
      })
    );
    throw error; // Re-throw the error to be handled by the caller
  }
}; 