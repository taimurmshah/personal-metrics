/**
 * Formats a given number of seconds into HH:MM:SS string format.
 * @param totalSeconds - The total number of seconds to format.
 * @returns A string representing the time in HH:MM:SS format.
 */
export const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  if (typeof totalSeconds !== 'number' || !isFinite(totalSeconds) || totalSeconds < 0) {
    // Handle invalid inputs gracefully
    // According to error-logging-guidelines, we might log this, but for a simple util,
    // returning a default or throwing an error are common.
    // For now, returning default as per initial skeleton.
    console.warn(`formatSecondsToHHMMSS received invalid input: ${totalSeconds}. Returning 00:00:00.`);
    return '00:00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60); // Use Math.floor to handle potential floating point inputs, though tests use integers.

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Formats a given number of minutes into Xh Ym string format.
 * @param totalMinutes - The total number of minutes to format.
 * @returns A string representing the time in Xh Ym format, or Ym if hours is 0.
 */
export const formatMinutesToHM = (totalMinutes: number): string => {
  if (typeof totalMinutes !== 'number' || !isFinite(totalMinutes) || totalMinutes < 0) {
    console.warn(`formatMinutesToHM received invalid input: ${totalMinutes}. Returning 0m.`);
    return '0m';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}; 