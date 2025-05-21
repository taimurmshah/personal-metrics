import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTimer, UseTimerReturn, TimerStatus } from '../hooks/useTimer'; // Corrected import path & import types
import { formatSecondsToHHMMSS as formatTime } from '../utils/timeFormatter';
import GlowButton from './GlowButton';

// Utility function to format seconds into HH:MM:SS or MM:SS
// const formatTime = (totalSeconds: number): string => {
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;
// 
//   const paddedHours = hours.toString().padStart(2, '0');
//   const paddedMinutes = minutes.toString().padStart(2, '0');
//   const paddedSeconds = seconds.toString().padStart(2, '0');
// 
//   if (hours > 0) {
//     return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
//   }
//   return `${paddedMinutes}:${paddedSeconds}`;
// };

interface TimerProps {
  // onSessionComplete is handled by the useTimer hook now directly via its handleStop
  onSessionSaved?: () => Promise<void>; 
}

const Timer: React.FC<TimerProps> = ({ onSessionSaved }) => {
  const {
    time, // Changed from seconds
    status, // Changed from isRunning/isPaused
    saveStatus,
    handleStart, // Changed from start
    handlePause, // Changed from pause
    handleResume, // Changed from resume
    handleStop, // Changed from stop
  }: UseTimerReturn = useTimer({ onSessionSaved });

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
      controls = (
        <GlowButton
          label="Start"
          onPress={handleStart}
          size="medium"
          testID="start-button"
        />
      );
      break;
    case 'running':
      controls = (
        <>
          <GlowButton
            label="Pause"
            onPress={handlePause}
            size="medium"
            testID="pause-button"
          />
          <GlowButton
            label="Stop"
            onPress={handleStopPress}
            size="medium"
            testID="stop-button"
          />
        </>
      );
      break;
    case 'paused':
      controls = (
        <>
          <GlowButton
            label="Resume"
            onPress={handleResume}
            size="medium"
            testID="resume-button"
          />
          <GlowButton
            label="Stop"
            onPress={handleStopPress}
            size="medium"
            testID="stop-button"
          />
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
    fontSize: 64,
    marginBottom: 40,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'], // monospaced numbers if supported
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 15,
    color: 'grey',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 20,
    flexWrap: 'nowrap',
  },
});

export default Timer; 