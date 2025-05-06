import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useTimer from '@/hooks/useTimer'; // Assuming the hook is here
import * as apiService from '@/services/api'; // Assuming API service functions are exported from here
import * as storageService from '@/utils/storage'; // Assuming token storage functions are here

// Mock the API service
vi.mock('@/services/api', () => ({
  saveSession: vi.fn(),
}));

// Mock the storage service
vi.mock('@/utils/storage', () => ({
  getApiToken: vi.fn(),
}));

describe('useTimer - API Interaction on Stop', () => {
  const mockApiToken = 'test-api-token';
  let consoleErrorSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mock implementations
    (storageService.getApiToken as vi.Mock).mockResolvedValue(mockApiToken);
    (apiService.saveSession as vi.Mock).mockResolvedValue({ success: true, sessionId: 'mock-session-id-123' });

    // Spy on console.error for testing error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Use fake timers to control Date.now() and setTimeout/setInterval
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers and spies
    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it('should call apiService.saveSession with correct data and token when timer is stopped', async () => {
    const { result } = renderHook(() => useTimer());
    const startTime = Date.now();
    vi.setSystemTime(startTime); // Set a fixed start time

    act(() => {
      result.current.handleStart(); // Assuming handleStart is exposed by the hook
    });

    const durationSeconds = 60;
    act(() => {
      vi.advanceTimersByTime(durationSeconds * 1000); // Advance timer by 60 seconds
    });

    await act(async () => {
      await result.current.handleStop(); // Assuming handleStop is exposed and might be async
    });

    expect(storageService.getApiToken).toHaveBeenCalledOnce();
    expect(apiService.saveSession).toHaveBeenCalledOnce();
    expect(apiService.saveSession).toHaveBeenCalledWith(
      {
        session_start_time: new Date(startTime).toISOString(), // As per API spec
        duration_seconds: durationSeconds,
      },
      mockApiToken // Assuming saveSession takes token as an argument
    );
  });

  it('should reset timer state after session is successfully saved', async () => {
    const { result } = renderHook(() => useTimer());

    act(() => { result.current.handleStart(); });
    vi.advanceTimersByTime(30 * 1000); // Run for 30 seconds

    await act(async () => {
      await result.current.handleStop();
    });

    // Assertions based on FR12: Reset timer, initial button state
    // These depend on how useTimer exposes its state (e.g., time, status)
    expect(result.current.time).toBe(0); // Assuming 'time' is the timer value in seconds or ms
    expect(result.current.status).toBe('initial'); // Or similar state indicator like isActive: false
  });

  it('should reset timer state even if API call to saveSession fails', async () => {
    (apiService.saveSession as vi.Mock).mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useTimer());

    act(() => { result.current.handleStart(); });
    vi.advanceTimersByTime(15 * 1000); // Run for 15 seconds

    await act(async () => {
      await result.current.handleStop();
    });

    // Assertions based on FR12: UI should reset
    expect(result.current.time).toBe(0);
    expect(result.current.status).toBe('initial'); 
  });

  it('should log an error if API call to saveSession fails', async () => {
    const apiError = new Error('Network Error');
    (apiService.saveSession as vi.Mock).mockRejectedValue(apiError);
    const { result } = renderHook(() => useTimer());

    act(() => { result.current.handleStart(); });
    vi.advanceTimersByTime(10 * 1000);

    await act(async () => {
      await result.current.handleStop();
    });
    
    // As per error-logging-guidelines and NF5
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error saving meditation session'), // Contextual message
      apiError // Include the actual error object
    );
  });

  it('should not attempt to save session if duration is zero or invalid', async () => {
    const { result } = renderHook(() => useTimer());
    const startTime = Date.now();
    vi.setSystemTime(startTime);

    act(() => {
      result.current.handleStart();
    });

    // Stop immediately or with invalid duration
    // (Assuming the hook itself would prevent this or handleStop would check duration)
    // For this test, let's assume handleStop is called without advancing time effectively.
    // If the hook prevents 0-duration saves internally, this test verifies that.
    // If handleStop is advanced by 0ms, duration might be 0.
    // vi.advanceTimersByTime(0); 

    await act(async () => {
      await result.current.handleStop();
    });

    expect(apiService.saveSession).not.toHaveBeenCalled();
    // Also check for a potential warning log
    // expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Session duration is zero. Not saving.'));
    
    // Ensure UI still resets
    expect(result.current.time).toBe(0);
    expect(result.current.status).toBe('initial');
  });

  it('should handle failure in retrieving API token gracefully', async () => {
    const tokenError = new Error('Failed to get token');
    (storageService.getApiToken as vi.Mock).mockRejectedValue(tokenError);
    const { result } = renderHook(() => useTimer());

    act(() => { result.current.handleStart(); });
    vi.advanceTimersByTime(20 * 1000);

    await act(async () => {
      await result.current.handleStop();
    });

    expect(apiService.saveSession).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to retrieve API token. Cannot save session.'),
      tokenError
    );

    // UI should still reset as per FR12
    expect(result.current.time).toBe(0);
    expect(result.current.status).toBe('initial');
  });
}); 