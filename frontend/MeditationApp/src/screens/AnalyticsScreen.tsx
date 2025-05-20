import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { fetchAnalyticsData } from '../services/api'; // Corrected path

// Define interfaces for the data
interface DailyTotal {
  date: string;
  minutes: number;
}

interface AnalyticsSummary {
  totalSessions: number;
  totalMinutes: number;
  averageMinutesPerDay: number;
  currentStreak: number;
  adherenceRate: number;
  daysWithSessions: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyTotals: DailyTotal[]; // Changed to array of objects for chart
}

const AnalyticsScreen = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6))); // Default to last 7 days
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Format dates to YYYY-MM-DD string for the API
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      
      const result = await fetchAnalyticsData({ from, to }); // Adjust if API expects different params

      // Transform dailyTotals from { 'YYYY-MM-DD': minutes } to { date: 'YYYY-MM-DD', minutes: number }[]
      const transformedDailyTotals = Object.entries(result.dailyTotals || {}).map(([date, minutes]) => ({
        date,
        minutes: Number(minutes), // Ensure minutes is a number
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date for the chart

      setData({ ...result, dailyTotals: transformedDailyTotals });
    } catch (e) {
      console.error("Failed to fetch analytics data:", e);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  const chartData = data?.dailyTotals.map(item => item.minutes) || [];
  const chartDates = data?.dailyTotals.map(item => new Date(item.date)) || [];

  const Gradient = () => (
    <Defs key={'gradient'}>
      <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
        <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} stopOpacity={0.8}/>
        <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} stopOpacity={0.2}/>
      </LinearGradient>
    </Defs>
  );


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadData} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text>No analytics data available for the selected period.</Text>
        <Button title="Try different dates" onPress={() => setShowStartDatePicker(true)} />
      </View>
    );
  }
  
  const xAxisHeight = 30;
  const verticalContentInset = { top: 10, bottom: 10 };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meditation Analytics</Text>

      <View style={styles.datePickerContainer}>
        <View style={styles.datePicker}>
          <Button onPress={() => setShowStartDatePicker(true)} title="Start Date" testID="start-date-picker-button" />
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
          {showStartDatePicker && (
            <DateTimePicker
              testID="start-date-picker"
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
        </View>
        <View style={styles.datePicker}>
          <Button onPress={() => setShowEndDatePicker(true)} title="End Date" testID="end-date-picker-button" />
          <Text style={styles.dateText}>{endDate.toDateString()}</Text>
          {showEndDatePicker && (
            <DateTimePicker
              testID="end-date-picker"
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
        </View>
      </View>

      {chartData.length > 0 ? (
        <View style={{ height: 250, flexDirection: 'row', paddingHorizontal: 10, marginTop: 20 }}>
           <YAxis
              data={chartData}
              style={{ marginBottom: xAxisHeight }}
              contentInset={verticalContentInset}
              svg={{ fontSize: 10, fill: 'grey' }}
              numberOfTicks={5}
              formatLabel={(value: number, index: number) => `${value}m`}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <LineChart
                style={{ flex: 1 }}
                data={chartData}
                svg={{ stroke: 'url(#gradient)', strokeWidth: 2 }}
                contentInset={verticalContentInset}
                curve={shape.curveNatural}
              >
                <Grid />
                <Gradient />
              </LineChart>
              <XAxis
                style={{ marginHorizontal: -10, height: xAxisHeight }}
                data={chartDates}
                formatLabel={(value: number, index: number) => {
                  const date = chartDates[index];
                  return date ? `${date.getMonth() + 1}/${date.getDate()}` : '';
                }}
                contentInset={{ left: 10, right: 10 }}
                svg={{ fontSize: 10, fill: 'grey' }}
              />
            </View>
        </View>
      ) : (
        <Text style={styles.centeredText}>No session data for this period to display chart.</Text>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>Total Sessions: {data.summary.totalSessions}</Text>
        <Text style={styles.summaryText}>Total Minutes: {data.summary.totalMinutes}</Text>
        <Text style={styles.summaryText}>Avg. Minutes/Day: {data.summary.averageMinutesPerDay.toFixed(1)}</Text>
        <Text style={styles.summaryText}>Current Streak: {data.summary.currentStreak} days</Text>
        <Text style={styles.summaryText}>Adherence Rate: {(data.summary.adherenceRate * 100).toFixed(1)}%</Text>
        <Text style={styles.summaryText}>Active Days: {data.summary.daysWithSessions}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: 'grey',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  datePicker: {
    alignItems: 'center',
  },
  dateText: {
    marginTop: 5,
    fontSize: 12,
    color: '#555',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
});

export default AnalyticsScreen; 