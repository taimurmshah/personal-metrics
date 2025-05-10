import { formatSecondsToHHMMSS } from '../timeFormatter';

describe('formatSecondsToHHMMSS', () => {
  it('should format 0 seconds correctly', () => {
    expect(formatSecondsToHHMMSS(0)).toBe('00:00:00');
  });

  it('should format less than 10 seconds with leading zero for seconds', () => {
    expect(formatSecondsToHHMMSS(5)).toBe('00:00:05');
  });

  it('should format seconds correctly (e.g., 30 seconds)', () => {
    expect(formatSecondsToHHMMSS(30)).toBe('00:00:30');
  });

  it('should format 59 seconds correctly', () => {
    expect(formatSecondsToHHMMSS(59)).toBe('00:00:59');
  });

  it('should format 60 seconds as 1 minute', () => {
    expect(formatSecondsToHHMMSS(60)).toBe('00:01:00');
  });

  it('should format more than 1 minute correctly (e.g., 1 minute 5 seconds)', () => {
    expect(formatSecondsToHHMMSS(65)).toBe('00:01:05');
  });

  it('should format less than 10 minutes with leading zero for minutes (e.g., 5 minutes)', () => {
    expect(formatSecondsToHHMMSS(300)).toBe('00:05:00');
  });

  it('should format minutes and seconds correctly (e.g., 9 minutes 59 seconds)', () => {
    expect(formatSecondsToHHMMSS(599)).toBe('00:09:59');
  });

  it('should format 10 minutes correctly', () => {
    expect(formatSecondsToHHMMSS(600)).toBe('00:10:00');
  });

  it('should format 59 minutes 59 seconds correctly', () => {
    expect(formatSecondsToHHMMSS(3599)).toBe('00:59:59');
  });

  it('should format 3600 seconds as 1 hour', () => {
    expect(formatSecondsToHHMMSS(3600)).toBe('01:00:00');
  });

  it('should format hours, minutes, and seconds correctly (e.g., 1 hour 1 minute 1 second)', () => {
    expect(formatSecondsToHHMMSS(3661)).toBe('01:01:01');
  });

  it('should format 10 hours correctly', () => {
    expect(formatSecondsToHHMMSS(36000)).toBe('10:00:00');
  });

  it('should format a large number of seconds correctly (e.g., 24 hours 59 minutes 59 seconds)', () => {
    expect(formatSecondsToHHMMSS(89999)).toBe('24:59:59');
  });

  it('should format an even larger number of seconds correctly (e.g., 26 hours 3 minutes 4 seconds)', () => {
    expect(formatSecondsToHHMMSS(93784)).toBe('26:03:04');
  });

  // Optional: Add tests for negative numbers or non-integer inputs if desired,
  // though for this use case, we primarily expect positive integers representing seconds.
  // For example:
  // it('should handle negative input gracefully', () => {
  //   expect(formatSecondsToHHMMSS(-10)).toBe('00:00:00'); // or throw error
  // });
  // it('should handle non-integer input gracefully', () => {
  //   expect(formatSecondsToHHMMSS(10.5)).toBe('00:00:10'); // or throw error, or round
  // });
}); 