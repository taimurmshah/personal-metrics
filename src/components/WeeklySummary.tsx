import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { parseISO, format } from 'date-fns';

interface SessionData {
  date: string;
  durationMinutes: number;
}

interface WeeklySummaryProps {
  sessions: SessionData[];
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ sessions }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 0.8; // Keep chart width relative

  const calculateAverageMinutes = () => {
    if (!sessions || sessions.length === 0) return 0;
    const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    // FR18: Average is over 7 days for a typical weekly summary.
    // If sessions array contains less than 7 days, it still averages over 7.
    return Math.round(totalMinutes / 7);
  };

  const averageMinutes = calculateAverageMinutes();

  // Process the sessions data to ensure we have exactly 7 days of data
  let processedSessions = [...sessions]; // Create a copy to avoid mutation
  
  // Ensure we have at most 7 most recent sessions
  if (processedSessions.length > 7) {
    processedSessions = processedSessions.slice(-7); // Keep only the 7 most recent
  }
  
  // Sort sessions by date (oldest to newest)
  processedSessions.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Generate data arrays for chart and labels
  let chartData = processedSessions.map(session => ({
    date: session.date,
    durationMinutes: session.durationMinutes,
    dayLabel: format(parseISO(session.date), 'E')
  }));
  
  // Pad with zeros and blank labels if we have fewer than 7 days
  while (chartData.length < 7) {
    // Add a placeholder date if needed
    const lastDate = chartData.length > 0 
      ? new Date(chartData[chartData.length - 1].date)
      : new Date();
    
    lastDate.setDate(lastDate.getDate() + 1);
    
    chartData.push({
      date: lastDate.toISOString().split('T')[0],
      durationMinutes: 0,
      dayLabel: '-'
    });
  }

  // Find the maximum value to scale the bars
  const maxValue = Math.max(...chartData.map(d => d.durationMinutes), 1); // Ensure at least 1 for division

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 7 days</Text>
      {sessions && sessions.length > 0 ? (
        <>
          {/* Custom chart implementation with flexbox for guaranteed alignment */}
          <View style={styles.chartContainer}>
            {/* Bar container */}
            <View style={styles.barsContainer}>
              {chartData.map((data, index) => (
                <View key={`bar-${index}`} style={styles.barColumn}>
                  {data.durationMinutes > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: (data.durationMinutes / maxValue) * 100, 
                          backgroundColor: 'rgba(100, 150, 255, 0.9)'
                        }
                      ]} 
                    />
                  )}
                </View>
              ))}
            </View>
            
            {/* Day labels container */}
            <View style={styles.labelsContainer}>
              {chartData.map((data, index) => (
                <View key={`label-${index}`} style={styles.labelColumn}>
                  <Text style={styles.labelText}>{data.dayLabel}</Text>
                </View>
              ))}
            </View>
          </View>
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
    backgroundColor: 'rgba(25, 25, 75, 0.6)', // Dark semi-transparent blue/purple
    borderRadius: 10,
    marginVertical: 10,
    width: '95%', 
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFFFFF', // White text
  },
  averageText: {
    fontSize: 16,
    marginTop: 15,
    color: '#E0E0E0', // Light gray/white text
  },
  noDataText: {
    fontSize: 14,
    color: '#B0B0B0', // Lighter gray for no data text
    textAlign: 'center',
    marginVertical: 30, // More vertical space when no chart
    fontStyle: 'italic',
  },
  chartContainer: {
    width: '100%',
    height: 150, // Fixed height similar to the original chart
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120, // Height of the bars area
    width: '100%',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '60%', // Width of each bar as a percentage of its column
    minHeight: 2, // Ensure very small values still show up
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    width: '100%',
  },
  labelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    color: '#E0E0E0',
  }
});

export default WeeklySummary; 