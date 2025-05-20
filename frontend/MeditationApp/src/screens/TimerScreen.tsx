import React, { useState, useCallback } from 'react';
import { StyleSheet, View, StatusBar, Image, SafeAreaView, Pressable, Text } from 'react-native';
import Timer from '../../../../src/components/Timer';
import WeeklySummary from '../../../../src/components/WeeklySummary';
import { useNavigation, type NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { fetchAnalyticsData } from '../services/api';
import { formatISO, subDays, addDays, eachDayOfInterval, parseISO } from 'date-fns';

// Define SessionData interface, mirrors what WeeklySummary expects
interface SessionData {
  date: string; // YYYY-MM-DD
  durationMinutes: number;
}

const TimerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [weeklySessionsData, setWeeklySessionsData] = useState<SessionData[]>([]);
  const [isLoadingWeeklySummary, setIsLoadingWeeklySummary] = useState<boolean>(true);
  const [weeklySummaryError, setWeeklySummaryError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadWeeklyData = async () => {
        setIsLoadingWeeklySummary(true);
        setWeeklySummaryError(null);
        try {
          const today = new Date();
          const startDate = formatISO(subDays(today, 6), { representation: 'date' }); // Start 6 days ago (for 7 total days)
          const endDateForApi = formatISO(addDays(today, 1), { representation: 'date' }); // End date for API (exclusive)
          
          const apiResponse = await fetchAnalyticsData({ from: startDate, to: endDateForApi });

          const dailyTotals: Record<string, number> = apiResponse.dailyTotals || {};
          
          const dateInterval = eachDayOfInterval({
            start: parseISO(startDate),
            end: today // up to and including today
          });

          const formattedSessions: SessionData[] = dateInterval.map((dateObj: Date) => {
            const dateStr = formatISO(dateObj, { representation: 'date' });
            const seconds = dailyTotals[dateStr] || 0; // Assuming dailyTotals provides seconds
            return {
              date: dateStr,
              durationMinutes: Math.round(seconds / 60),
            };
          });

          setWeeklySessionsData(formattedSessions);
          // setWeeklySessionsData([]); // Temporarily set to empty
        } catch (error) {
          console.error("Failed to load weekly summary data:", error);
          setWeeklySummaryError("Failed to load summary.");
          setWeeklySessionsData([]); // Clear data on error
        } finally {
          setIsLoadingWeeklySummary(false);
        }
      };

      loadWeeklyData();

      return () => {
        // Optional: cleanup if needed when screen loses focus
      };
    }, [])
  );

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
              {isLoadingWeeklySummary ? (
                <Text style={{color: 'white', textAlign: 'center'}}>Loading summary...</Text>
              ) : weeklySummaryError ? (
                <Text style={{color: 'red', textAlign: 'center'}}>{weeklySummaryError}</Text>
              ) : (
                <WeeklySummary sessions={weeklySessionsData} />
              )}
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