import React from 'react';
import { StyleSheet, View, StatusBar, Image, SafeAreaView, Pressable } from 'react-native';
import Timer from '../../../../src/components/Timer';
import WeeklySummary from '../../../../src/components/WeeklySummary';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

const TimerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleGoToAnalytics = () => {
    navigation.navigate('Analytics');
  };

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
            {/* Weekly Summary panel acting as navigation trigger */}
            <Pressable onPress={handleGoToAnalytics} testID="weekly-summary-panel" style={styles.weeklySummaryContainer}>
              <WeeklySummary sessions={[]} />
            </Pressable>
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
  weeklySummaryContainer: {
    marginTop: 30,
    width: '100%',
  },
});

export default TimerScreen; 