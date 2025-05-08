import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'user_api_token';

/**
 * Saves the API token to secure storage.
 * @param token The API token to save.
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.info(JSON.stringify({ message: 'Token saved successfully', source: 'storage.ts' }));
  } catch (error) {
    console.error(JSON.stringify({
      message: 'Error saving token',
      error: error instanceof Error ? error.message : String(error),
      source: 'storage.ts'
    }));
    // Re-throw the error to allow calling function to handle UI feedback
    throw new Error('Failed to save authentication token.');
  }
};

/**
 * Retrieves the API token from secure storage.
 * @returns The stored API token, or null if not found.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.info(JSON.stringify({ message: 'Token retrieved successfully', hasToken: !!token, source: 'storage.ts' }));
    return token;
  } catch (error) {
    console.error(JSON.stringify({
      message: 'Error retrieving token',
      error: error instanceof Error ? error.message : String(error),
      source: 'storage.ts'
    }));
    // Re-throw the error
    throw new Error('Failed to retrieve authentication token.');
  }
};

/**
 * Removes the API token from secure storage.
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.info(JSON.stringify({ message: 'Token removed successfully', source: 'storage.ts' }));
  } catch (error) {
    console.error(JSON.stringify({
      message: 'Error removing token',
      error: error instanceof Error ? error.message : String(error),
      source: 'storage.ts'
    }));
    // Re-throw the error
    throw new Error('Failed to remove authentication token.');
  }
}; 