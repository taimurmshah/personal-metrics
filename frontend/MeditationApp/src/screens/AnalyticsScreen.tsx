import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Text as SvgText, G, Circle } from 'react-native-svg';
import { fetchAnalyticsData } from '../services/api';
import { useNavigation } from '@react-navigation/native';

// Define interfaces for the data
interface DailyTotal {
  date: string;
  minutes: number;
}

interface AnalyticsSummary {
  totalMinutes: number;
  averageMinutesPerDay: number;
  currentStreak: number;
  longestStreak: number;
  daysWithSessions: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyTotals: DailyTotal[];
}

// Define time range options
type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];

interface TabLayout {
  x: number;
  width: number;
}

const AnalyticsScreen = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1W');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const [tabLayouts, setTabLayouts] = useState<Record<TimeRange, TabLayout | null>>({
    '1W': null,
    '1M': null,
    '3M': null,
    '6M': null,
    '1Y': null,
  });

  const indicatorPositionX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Calculate start and end dates based on the selected range
  const calculateDateRange = useCallback((range: TimeRange): { startDate: Date; endDate: Date } => {
    const endDate = new Date();
    // Add one day to the endDate to make it inclusive for the current day's data
    endDate.setDate(endDate.getDate() + 1);
    const startDate = new Date();
    
    switch (range) {
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7); // Default to 1 week
    }
    
    return { startDate, endDate };
  }, []);

  const loadData = useCallback(async () => {
    if (!data) { // Only show full screen loader if no data is currently displayed
      setLoading(true);
    }
    setError(null);
    try {
      const { startDate, endDate } = calculateDateRange(selectedRange);
      
      // Format dates to YYYY-MM-DD string for the API
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      
      const result = await fetchAnalyticsData({ from, to });

      // Fill in all days in the range with zeros for missing days
      const allDates: string[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allDates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Create an object with all dates initialized to 0 minutes
      const filledDailyTotals: Record<string, number> = allDates.reduce((acc, date) => {
        acc[date] = 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Merge with actual data
      Object.entries(result.dailyTotals || {}).forEach(([date, seconds]) => {
        filledDailyTotals[date] = seconds;
      });

      // Transform daily totals from { 'YYYY-MM-DD': seconds } to { date: 'YYYY-MM-DD', minutes: number }[]
      // Convert seconds to minutes during the transformation
      const transformedDailyTotals = Object.entries(filledDailyTotals).map(([date, seconds]) => ({
        date,
        minutes: Math.round(Number(seconds) / 60), // Convert seconds to minutes
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date for the chart

      setData({ ...result, dailyTotals: transformedDailyTotals });
    } catch (e) {
      console.error("Failed to fetch analytics data:", e);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedRange, calculateDateRange, data]);

  useEffect(() => {
    loadData();
  }, [selectedRange]); // Keep loadData dependency if its definition changes based on selectedRange, otherwise selectedRange is enough

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range); // Update the selected range first
    // loadData(); // This will be implicitly called by useEffect reacting to selectedRange change if loadData depends on it
                  // Or, if loadData is stable and doesn't depend on selectedRange in its definition, call it explicitly.
                  // For now, assuming useEffect will handle it due to selectedRange in loadData's deps array.

    // Animate the indicator immediately
    const layout = tabLayouts[range];
    if (layout) {
      Animated.spring(indicatorPositionX, {
        toValue: layout.x,
        useNativeDriver: false, // 'left' and 'width' are not supported by native driver
      }).start();
      Animated.spring(indicatorWidth, {
        toValue: layout.width,
        useNativeDriver: false,
      }).start();
    }
  };
  
  const handleTabLayout = (event: any, range: TimeRange) => {
    const { x, width } = event.nativeEvent.layout;
    const newLayouts = {...tabLayouts, [range]: { x, width }};
    setTabLayouts(newLayouts);

    // If this is the selected range, immediately update indicator
    if (range === selectedRange) {
      indicatorPositionX.setValue(x);
      indicatorWidth.setValue(width);
    }

    // Check if all layouts are now available
    const allLayoutsAvailable = TIME_RANGES.every(r => newLayouts[r] !== null);
    if (allLayoutsAvailable) {
      // All tabs have measured, ensure selected tab is highlighted
      const selectedLayout = newLayouts[selectedRange];
      if (selectedLayout) {
        indicatorPositionX.setValue(selectedLayout.x);
        indicatorWidth.setValue(selectedLayout.width);
      }
    }
  };

  const getSummaryTitle = (range: TimeRange): string => {
    switch (range) {
      case '1W': return 'One Week Summary';
      case '1M': return 'One Month Summary';
      case '3M': return 'Three Month Summary';
      case '6M': return 'Six Month Summary';
      case '1Y': return 'One Year Summary';
      default: return 'Summary';
    }
  };

  const chartData = data?.dailyTotals.map(item => item.minutes) || [];
  const chartDates = data?.dailyTotals.map(item => new Date(item.date)) || [];

  // Determine which dates should show labels based on selected range
  const shouldShowLabel = useCallback((date: Date, index: number): boolean => {
    switch (selectedRange) {
      case '1W':
        // Show every other day for 1 week view
        return index % 2 === 0;
      case '1M':
        // Show only Mondays for 1 month view
        return date.getDay() === 1; // Monday is 1
      case '3M':
        // Show only 1st of each month for 3 month view
        return date.getDate() === 1;
      case '6M':
        // Show only 1st of month for 6 month view
        return date.getDate() === 1;
      case '1Y':
        // Show only 1st day of each month for 1 year view
        return date.getDate() === 1;
      default:
        return false;
    }
  }, [selectedRange]);

  const filteredXAxisChartDates = useMemo(() => {
    if (!chartDates) return [];
    // The `index` here is the original index from the full `chartDates` array.
    return chartDates.filter((date, index) => shouldShowLabel(date, index));
  }, [chartDates, shouldShowLabel]);

  // Format the x-axis label based on selected range
  const formatXAxisLabel = useCallback((
    date: Date, // Changed: this is now the actual Date object from filteredXAxisChartDates
    index: number // This is the index within filteredXAxisChartDates
  ): string => {
    // if (!date) { // Guard against undefined date object
    //   return '';
    // }
    // Add a more robust check for valid Date objects
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    // The `shouldShowLabel` check is no longer needed here as the list is pre-filtered.

    switch (selectedRange) {
      case '1W':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case '1M':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case '3M':
      case '6M':
      case '1Y':
        // Just show month name for longer time periods
        return date.toLocaleString('default', { month: 'short' });
      default:
        return '';
    }
  }, [selectedRange]); // Dependency only on selectedRange now

  // We use the decorator pattern provided by `react-native-svg-charts` so we have
  // access to the `x` and `y` helpers that convert an index/value into the exact
  // pixel position within the chart.
  // Ref: https://github.com/JesperLekland/react-native-svg-charts#decorators- 📈
  interface DecoratorProps {
    x?: (value: number) => number;
    y?: (value: number) => number;
    data?: number[];
  }

  const MaxValueDecorator = ({ x, y, data }: DecoratorProps) => {
    if (!data || !x || !y || data.length === 0) return null;

    const maxValue = Math.max(...data);
    const maxIndex = data.indexOf(maxValue);

    // Guard against all-zero data or not found
    if (maxValue <= 0 || maxIndex === -1) return null;

    const cx = x(maxIndex);
    const cy = y(maxValue);

    // Shift label horizontally when at chart edges so text isn't clipped
    let dx = 0;
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';

    if (maxIndex === data.length - 1) {
      // Right edge → draw text to the left of the point
      dx = -6;
      textAnchor = 'end';
    } else if (maxIndex === 0) {
      // Left edge → draw text to the right of the point
      dx = 6;
      textAnchor = 'start';
    }

    return (
      <G key={"max-value-decorator"}>
        {/* Peak marker */}
        <Circle cx={cx} cy={cy} r={4} fill="#4AE54A" />
        {/* Position label so it's fully visible */}
        <SvgText
          x={cx + dx}
          y={cy - 15}
          fontSize={14}
          fontWeight="bold"
          fill="#4AE54A"
          textAnchor={textAnchor}
        >
          {`${maxValue}m`}
        </SvgText>
      </G>
    );
  };

  // Initialize tab indicator for 1W on first render
  useEffect(() => {
    // Set default 1W tab indicator width to 20% of container (5 tabs)
    const screenWidth = Platform.OS === 'ios' ? 375 : 400; // Default screen width
    const tabWidth = (screenWidth - 32) / 5; // Accounting for paddingHorizontal in scrollContainer
    
    // Set indicator to 1W position (first tab)
    indicatorWidth.setValue(tabWidth);
    indicatorPositionX.setValue(0);
  }, []);

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
        <Button title="Try different range" onPress={() => handleRangeChange('1M')} />
      </View>
    );
  }
  
  const xAxisHeight = 30;
  // Add right inset to provide breathing room for max-value label on the far-right point
  // Increase top inset to provide more space for the max value label
  const chartContentInset = { top: 20, bottom: 10, left: 10, right: 20 };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Timer</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meditation Analytics</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Time range selector tabs */}
        <View style={styles.timeRangeContainer} testID="timeRangeContainer">
          <Animated.View
            style={[
              styles.selectedTimeRangeTabIndicator,
              {
                left: indicatorPositionX,
                width: indicatorWidth,
              },
            ]}
          />
          {TIME_RANGES.map((range) => (
            <TouchableOpacity 
              key={range}
              style={styles.timeRangeTab}
              onPress={() => handleRangeChange(range)}
              testID={`range-${range}`}
              onLayout={(event) => handleTabLayout(event, range)}
            >
              <Text 
                style={[
                  styles.timeRangeText,
                  selectedRange === range && styles.selectedTimeRangeText
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
             <YAxis
                data={chartData}
                style={styles.yAxis}
                contentInset={chartContentInset}
                svg={{ fontSize: 10, fill: '#999999' }}
                numberOfTicks={3}
                min={0}
                max={60}
                formatLabel={(value) => `${value}m`}
              />
              <View style={styles.chartWrapper}>
                <LineChart
                  style={{ flex: 1 }}
                  data={chartData}
                  svg={{ stroke: '#4AE54A', strokeWidth: 2.5 }}
                  contentInset={chartContentInset}
                  curve={shape.curveLinear}
                  yMin={0}
                  yMax={60}
                >
                  <Grid svg={{ stroke: '#333333' }} />
                  {chartData.length > 0 && <MaxValueDecorator />}
                </LineChart>
                <XAxis
                  key={selectedRange}
                  style={styles.xAxis}
                  data={filteredXAxisChartDates}
                  formatLabel={formatXAxisLabel}
                  contentInset={{ left: chartContentInset.left, right: chartContentInset.right }}
                  svg={{ fontSize: 10, fill: '#999999' }}
                />
              </View>
          </View>
        ) : (
          <Text style={styles.centeredText}>No session data for this period to display chart.</Text>
        )}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>{getSummaryTitle(selectedRange)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Minutes</Text>
              <Text style={styles.summaryValue}>{data.summary.totalMinutes}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg. Minutes/Day</Text>
              <Text style={styles.summaryValue}>{data.summary.averageMinutesPerDay.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Streak</Text>
              <Text style={styles.summaryValue}>
                {data.summary.currentStreak} {data.summary.currentStreak === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Longest Streak</Text>
              <Text style={styles.summaryValue}>
                {data.summary.longestStreak} {data.summary.longestStreak === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Days</Text>
              <Text style={styles.summaryValue}>{data.summary.daysWithSessions}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 70 : 30, // Increased top padding
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Evenly space the items
    marginBottom: 25, // Increased bottom margin
    paddingHorizontal: 16,
    height: 44, // Fixed height for header
  },
  backButton: {
    width: 70, // Fixed width for better alignment
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 70, // Same width as backButton for symmetry
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  centeredText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#999999',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    position: 'relative',
    height: 44,
    overflow: 'hidden',
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectedTimeRangeTabIndicator: {
    position: 'absolute',
    height: '80%',
    top: '10%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeRangeText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  selectedTimeRangeText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  chartContainer: {
    height: 250,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  chartWrapper: {
    flex: 1, 
    marginLeft: 10
  },
  yAxis: {
    marginBottom: 30,
    marginTop: 10 // Add margin to align with chart's content inset
  },
  xAxis: {
    marginHorizontal: -10, 
    height: 30
  },
});

export default AnalyticsScreen; 