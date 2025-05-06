import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// We'll assume the actual module uses @react-native-async-storage/async-storage
// Mocking it directly here.
// Note: If the actual implementation imports it differently, this mock path might need adjustment.
vi.mock('@react-native-async-storage/async-storage', () => ({
  setItem: vi.fn(() => Promise.resolve(null)),
  getItem: vi.fn(() => Promise.resolve(null)),
  removeItem: vi.fn(() => Promise.resolve(null)),
}));

// Import the functions to be tested (assuming they will be in src/utils/storage.ts)
// These functions don't exist yet, but TDD means we write tests first.
import { saveToken, getToken, removeToken, TOKEN_KEY } from './storage'; // Assuming TOKEN_KEY is exported for testability or internal use check
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Secure Token Storage', () => {
  beforeEach(() => {
    // Clear all mocks before each test, as per testing-guidelines.mdc
    vi.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should call AsyncStorage.setItem with the correct key and token', async () => {
      const mockToken = 'test-auth-token-123';
      await saveToken(mockToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, mockToken);
    });

    it('should resolve successfully after saving', async () => {
      const mockToken = 'test-auth-token-123';
      await expect(saveToken(mockToken)).resolves.toBeUndefined();
    });

    it('should handle errors from AsyncStorage.setItem', async () => {
      const mockToken = 'test-auth-token-error';
      const setError = new Error('Failed to save token');
      (AsyncStorage.setItem as vi.Mock).mockRejectedValueOnce(setError);
      
      // console.error will be called by the saveToken function as per error-logging-guidelines
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(saveToken(mockToken)).rejects.toThrow('Failed to save token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, mockToken);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        JSON.stringify({
          level: 'ERROR',
          message: 'Failed to save token to AsyncStorage',
          error: setError,
          tokenKey: TOKEN_KEY,
        })
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getToken', () => {
    it('should call AsyncStorage.getItem with the correct key', async () => {
      await getToken();
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('should return the token if found in AsyncStorage', async () => {
      const mockToken = 'retrieved-auth-token-456';
      (AsyncStorage.getItem as vi.Mock).mockResolvedValueOnce(mockToken);
      const token = await getToken();
      expect(token).toBe(mockToken);
    });

    it('should return null if no token is found in AsyncStorage', async () => {
      (AsyncStorage.getItem as vi.Mock).mockResolvedValueOnce(null);
      const token = await getToken();
      expect(token).toBeNull();
    });

    it('should handle errors from AsyncStorage.getItem', async () => {
      const getError = new Error('Failed to get token');
      (AsyncStorage.getItem as vi.Mock).mockRejectedValueOnce(getError);
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(getToken()).rejects.toThrow('Failed to get token');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        JSON.stringify({
          level: 'ERROR',
          message: 'Failed to retrieve token from AsyncStorage',
          error: getError,
          tokenKey: TOKEN_KEY,
        })
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeToken', () => {
    it('should call AsyncStorage.removeItem with the correct key', async () => {
      await removeToken();
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('should resolve successfully after removing', async () => {
      await expect(removeToken()).resolves.toBeUndefined();
    });

    it('should handle errors from AsyncStorage.removeItem', async () => {
      const removeError = new Error('Failed to remove token');
      (AsyncStorage.removeItem as vi.Mock).mockRejectedValueOnce(removeError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(removeToken()).rejects.toThrow('Failed to remove token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        JSON.stringify({
          level: 'ERROR',
          message: 'Failed to remove token from AsyncStorage',
          error: removeError,
          tokenKey: TOKEN_KEY,
        })
      );
      consoleErrorSpy.mockRestore();
    });
  });
}); 