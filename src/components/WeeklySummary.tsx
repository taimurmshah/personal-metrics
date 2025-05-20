import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-svg-charts';

interface SessionData {
  date: string;
  durationMinutes: number;
}

interface WeeklySummaryProps {
  sessions: SessionData[];
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ sessions }) => {
  const screenWidth = Dimensions.get('window').width;

  const calculateAverageMinutes = () => {
    if (!sessions || sessions.length === 0) return 0;
    const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    // Assuming a 7-day week for average calculation, even if fewer days have data.
    // FR18 might specify if average is over days with sessions or fixed 7 days.
    // For now, let's use 7 days for a typical weekly summary.
    return Math.round(totalMinutes / 7); 
  };

  const averageMinutes = calculateAverageMinutes();

  const chartData = sessions.map(session => session.durationMinutes);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Summary</Text>
      {sessions && sessions.length > 0 ? (
        <>
          <BarChart
            style={{ height: 150, width: screenWidth * 0.8 }}
            data={chartData}
            svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            contentInset={{ top: 20, bottom: 20 }}
            spacingInner={0.2}
            spacingOuter={0.1}
          >
            {/* TODO: Consider adding Grid or Axes if needed from react-native-svg-charts */}
          </BarChart>
          <Text style={styles.averageText}>Average Minutes: {averageMinutes} min</Text>
        </>
      ) : (
        <>
          <Text style={styles.noDataText}>No session data for this week.</Text>
          <Text style={styles.averageText}>Average Minutes: 0 min</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 10,
    width: '90%', // Take up most of the parent width
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  averageText: {
    fontSize: 16,
    marginTop: 10,
  },
  noDataText: {
    fontSize: 14,
    color: 'grey',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default WeeklySummary; 