/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  View,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import AuthScreen from './src/screens/AuthScreen';
// @ts-ignore - TimerScreen path is correct; TS resolves via metro
import TimerScreen from './src/screens/TimerScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent(): React.ReactElement {
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated } = useAuth();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1, // Ensure SafeAreaView takes full height
  };

  // If authenticated, render TimerScreen directly without wrapping it in SafeAreaView
  // because TimerScreen has its own SafeAreaView handling
  if (isAuthenticated) {
    return <TimerScreen />;
  }

  // For non-authenticated state (AuthScreen), keep using SafeAreaView
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <AuthScreen />
    </SafeAreaView>
  );
}

function App(): React.ReactElement {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
