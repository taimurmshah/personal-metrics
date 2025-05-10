import React from 'react';
import { StyleSheet, View, StatusBar, Image, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Import useAuth if needed for logout etc.
import Timer from '../../../../src/components/Timer'; // Corrected import path for Timer component

const TimerScreen: React.FC = () => {
  // const { logout } = useAuth(); // Example: Get logout function if needed

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Full-screen background image with absolute positioning */}
      <Image 
        source={require('../assets/images/night_sky_background.png')} 
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      
      {/* Content with SafeAreaView */}
      <View style={styles.fullScreenContainer}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.contentContainer}>
            <Timer />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default TimerScreen; 