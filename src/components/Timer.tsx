import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTimer, UseTimerReturn, TimerStatus } from '../hooks/useTimer'; // Corrected import path & import types

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
  // onSessionComplete is handled by the useTimer hook now directly via its handleStop
}

const Timer: React.FC<TimerProps> = () => {
  const {
    time, // Changed from seconds
    status, // Changed from isRunning/isPaused
    saveStatus,
    handleStart, // Changed from start
    handlePause, // Changed from pause
    handleResume, // Changed from resume
    handleStop, // Changed from stop
  }: UseTimerReturn = useTimer();

  // The useTimer hook's handleStop now handles the logic internally,
  // including calling an onComplete callback if that pattern is maintained within the hook.
  // For this component, we just call handleStop.
  const handleStopPress = async () => {
    await handleStop(); 
  };

  // Determine status message
  let statusMessage: string | null = null;
  if (saveStatus === 'saving') statusMessage = 'Saving session...';
  else if (saveStatus === 'success') statusMessage = 'Session saved successfully!';
  else if (saveStatus === 'error') statusMessage = 'Error: Could not save session.';

  // Determine control buttons based on timer status
  let controls: React.ReactNode = null;
  switch (status) {
    case 'initial':
      controls = <Button title="Start" onPress={handleStart} testID="start-button" />;
      break;
    case 'running':
      controls = (
        <>
          <Button title="Pause" onPress={handlePause} testID="pause-button" />
          <Button title="Stop" onPress={handleStopPress} testID="stop-button" />
        </>
      );
      break;
    case 'paused':
      controls = (
        <>
          <Button title="Resume" onPress={handleResume} testID="resume-button" />
          <Button title="Stop" onPress={handleStopPress} testID="stop-button" />
        </>
      );
      break;
    default:
      controls = null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timeDisplay}>{formatTime(time)}</Text>
      {statusMessage && <Text style={styles.statusMessage}>{statusMessage}</Text>}
      <View style={styles.controls}>{controls}</View>
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