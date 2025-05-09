import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { getToken, saveToken, removeToken } from '../utils/storage';
import { ActivityIndicator, View } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  apiToken: string | null;
  isLoading: boolean; // Add loading state
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as loading

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken: string | null = null;
      try {
        userToken = await getToken('AuthContext_bootstrapAsync');
        if (userToken) {
          setApiToken(userToken);
          setIsAuthenticated(true);
          // TODO: Optionally verify token with backend here
        }
      } catch (e) {
        console.error('Restoring token failed', e);
        // Consider removing invalid token if restore fails
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (token: string) => {
    try {
      await saveToken(token);
      setApiToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to save the token', error);
      // Handle login error (e.g., show message to user)
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      setApiToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to remove the token', error);
      // Handle logout error
    }
  };

  // Show loading indicator while checking token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, apiToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 