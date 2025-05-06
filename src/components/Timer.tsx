import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTimer } from '../../hooks/useTimer'; // Adjusted path

// Utility function to format seconds into HH:MM:SS or MM:SS
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
};

interface TimerProps {
  onSessionComplete?: (duration: number) => void;
}

const Timer: React.FC<TimerProps> = ({ onSessionComplete }) => {
  const {
    seconds,
    isRunning,
    isPaused,
    saveStatus,
    start,
    pause,
    resume,
    stop,
  } = useTimer();

  const handleStopPress = () => {
    stop(onSessionComplete); // Pass the onSessionComplete callback to the hook's stop function
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeDisplay}>{formatTime(seconds)}</Text>
      {(saveStatus === 'saving' || saveStatus === 'success' || saveStatus === 'error') && (
        <Text style={styles.statusMessage}>
          {saveStatus === 'saving' && 'Saving session...'}
          {saveStatus === 'success' && 'Session saved successfully!'}
          {saveStatus === 'error' && 'Error: Could not save session.'}
        </Text>
      )}
      <View style={styles.controls}>
        {!isRunning && !isPaused && (
          <Button title="Start" onPress={start} testID="start-button" />
        )}
        {isRunning && !isPaused && (
          <>
            <Button title="Pause" onPress={pause} testID="pause-button" />
            <Button title="Stop" onPress={handleStopPress} testID="stop-button" />
          </>
        )}
        {isPaused && (
          <>
            <Button title="Resume" onPress={resume} testID="resume-button" />
            <Button title="Stop" onPress={handleStopPress} testID="stop-button" />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    fontSize: 48,
    marginBottom: 20,
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 15,
    color: 'grey',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
});

export default Timer; 