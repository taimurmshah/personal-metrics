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
 * @param caller Optional identifier for the calling function/context.
 * @returns A promise that resolves with the token string if found, or null otherwise.
 */
export const getToken = async (caller?: string): Promise<string | null> => {
  const callMarker = caller || 'Unknown';
  console.log(`[storage.ts] getToken called by: ${callMarker}. Attempting to get item with key: ${TOKEN_KEY}`);
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const tokenPreview = token ? token.substring(0, 20) + '...' : 'null';
    console.log(`[storage.ts] getToken (called by: ${callMarker}): AsyncStorage.getItem for key '${TOKEN_KEY}' returned: ${token ? 'A TOKEN' : 'NULL'}. Value preview: ${tokenPreview}`);
    return token;
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: `[storage.ts] Failed to retrieve token from AsyncStorage (called by: ${callMarker})`,
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
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