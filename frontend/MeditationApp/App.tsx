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
// @ts-ignore - TimerScreen path is correct; TS resolves via metro
import TimerScreen from './src/screens/TimerScreen';
// @ts-ignore - AnalyticsScreen path is correct; TS resolves via metro
import AnalyticsScreen from './src/screens/AnalyticsScreen'; 
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// Define the type for the stack navigator params
export type RootStackParamList = {
  Timer: undefined; // No params expected for Timer screen
  Analytics: undefined; // No params expected for Analytics screen
  // Add other screens here if needed
};

function AppContent(): React.ReactElement {
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated } = useAuth();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1, // Ensure SafeAreaView takes full height
  };

  if (isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Timer">
          <Stack.Screen name="Timer" component={TimerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
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
