import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Import useAuth if needed for logout etc.
import Timer from '../../../../src/components/Timer'; // Corrected import path for Timer component

const TimerScreen: React.FC = () => {
  // const { logout } = useAuth(); // Example: Get logout function if needed

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer Screen</Text>
      {/* <Text style={styles.timerDisplay}>00:00:00</Text> */}
      {/* The Timer component will now display the time and controls */}
      <Timer />
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
    // Consider using a monospaced font if available
    fontFamily: 'Courier New', // Example monospace font
  },
});

export default TimerScreen; 