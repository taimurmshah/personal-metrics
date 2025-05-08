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
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import AuthScreen from './src/screens/AuthScreen';
import TimerScreen from './src/screens/TimerScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent(): React.ReactElement {
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated } = useAuth();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1, // Ensure SafeAreaView takes full height
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {isAuthenticated ? <TimerScreen /> : <AuthScreen />}
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
