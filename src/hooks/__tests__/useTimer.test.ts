import { act, renderHook } from '@testing-library/react';
import { useTimer } from '../useTimer'; // Assuming useTimer.ts will be in ../

// vi.useFakeTimers() will be called in beforeEach
// vi.clearAllTimers() will be called in afterEach

describe('useTimer Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks(); // Clear any mocks if used within tests
  });

  it('should initialize with 0 seconds, not running, not paused', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.seconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('should start the timer and increment seconds', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000); // Advance by 1 second
    });
    expect(result.current.seconds).toBe(1);

    act(() => {
      vi.advanceTimersByTime(2000); // Advance by another 2 seconds
    });
    expect(result.current.seconds).toBe(3);
  });

  it('should pause the timer', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(2000); // Run for 2 seconds
    });
    expect(result.current.seconds).toBe(2);

    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(true);
    expect(result.current.seconds).toBe(2); // Time should not change while paused

    act(() => {
      vi.advanceTimersByTime(3000); // Advance time
    });
    expect(result.current.seconds).toBe(2); // Still 2 seconds
  });

  it('should resume the timer after pausing', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(2000); // 2 seconds
      result.current.pause();
      vi.advanceTimersByTime(3000); // Elapse 3 more seconds while paused
    });
    expect(result.current.seconds).toBe(2);

    act(() => {
      result.current.resume();
    });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(2); // Still 2 seconds immediately after resume

    act(() => {
      vi.advanceTimersByTime(1000); // Advance 1 second
    });
    expect(result.current.seconds).toBe(3);
  });

  it('should stop the timer, reset seconds, and return duration', () => {
    const { result } = renderHook(() => useTimer());
    const onStopCallback = vi.fn();


    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000); // Run for 5 seconds
    });
    expect(result.current.seconds).toBe(5);

    act(() => {
      result.current.stop(onStopCallback);
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(0); // Resets to 0
    expect(onStopCallback).toHaveBeenCalledTimes(1);
    expect(onStopCallback).toHaveBeenCalledWith(5); // Reports 5 seconds duration
  });

  it('should not do anything if pause or resume is called when not appropriate', () => {
    const { result } = renderHook(() => useTimer());

    // Try pausing when not running
    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(0);

    // Try resuming when not paused
    act(() => {
      result.current.resume();
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(0);

    // Start and then try resuming (should do nothing)
    act(() => {
      result.current.start();
      vi.advanceTimersByTime(1000);
      result.current.resume(); // Resuming while already running
    });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(1);


    // Start, pause, then try pausing again (should do nothing)
    act(() => {
        result.current.pause();
        result.current.pause(); // Pausing while already paused
      });
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);
      expect(result.current.seconds).toBe(1);

  });

  it('should not start if already running', () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(1);

    act(() => {
      result.current.start(); // Try starting again
    });
    // State should remain as if start wasn't called again, timer continues
    act(() => {
        vi.advanceTimersByTime(1000);
      });
    expect(result.current.seconds).toBe(2); // Continues from original start
    expect(result.current.isRunning).toBe(true);
  });

  it('should stop the timer when paused and report correct duration', () => {
    const { result } = renderHook(() => useTimer());
    const onStopCallback = vi.fn();

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(3000); // Run for 3 seconds
      result.current.pause();
      vi.advanceTimersByTime(2000); // Stay paused for 2 seconds
    });
    expect(result.current.seconds).toBe(3);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.stop(onStopCallback);
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(0);
    expect(onStopCallback).toHaveBeenCalledTimes(1);
    expect(onStopCallback).toHaveBeenCalledWith(3);
  });

  it('calling stop when not running should not call onStopCallback and reset to 0', () => {
    const { result } = renderHook(() => useTimer());
    const onStopCallback = vi.fn();

    act(() => {
      result.current.stop(onStopCallback);
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.seconds).toBe(0);
    expect(onStopCallback).not.toHaveBeenCalled();
  });
}); 