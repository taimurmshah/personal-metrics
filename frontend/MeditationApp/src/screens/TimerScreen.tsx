import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Import useAuth if needed for logout etc.
import Timer from '../../../../src/components/Timer'; // Corrected import path for Timer component

const TimerScreen: React.FC = () => {
  // const { logout } = useAuth(); // Example: Get logout function if needed

  return (
    <SafeAreaView style={styles.container}>
      <Timer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E', // Dark fallback background; replace later with gradient image
  },
});

export default TimerScreen; 