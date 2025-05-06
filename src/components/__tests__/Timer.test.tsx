import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import Timer from '../Timer';

describe('Timer Component State Transitions', () => {
  it('should display initial state correctly', () => {
    render(<Timer />);
    expect(screen.getByText('00:00:00')).toBeTruthy();
    expect(screen.getByTestId('start-button')).toBeTruthy();
    expect(screen.queryByTestId('pause-button')).toBeNull();
    expect(screen.queryByTestId('resume-button')).toBeNull();
    expect(screen.queryByTestId('stop-button')).toBeNull();
  });

  it('should transition from initial to running on Start press', () => {
    render(<Timer />);
    fireEvent.press(screen.getByTestId('start-button'));
    expect(screen.getByTestId('pause-button')).toBeTruthy();
    expect(screen.getByTestId('stop-button')).toBeTruthy();
    expect(screen.queryByTestId('start-button')).toBeNull();
    expect(screen.queryByTestId('resume-button')).toBeNull();
  });

  it('should transition from running to paused on Pause press', () => {
    render(<Timer />);
    fireEvent.press(screen.getByTestId('start-button')); // to running
    fireEvent.press(screen.getByTestId('pause-button')); // to paused
    expect(screen.getByTestId('resume-button')).toBeTruthy();
    expect(screen.getByTestId('stop-button')).toBeTruthy(); // Stop should still be visible
    expect(screen.queryByTestId('pause-button')).toBeNull();
    expect(screen.queryByTestId('start-button')).toBeNull();
  });

  it('should transition from paused to running on Resume press', () => {
    render(<Timer />);
    fireEvent.press(screen.getByTestId('start-button')); // to running
    fireEvent.press(screen.getByTestId('pause-button')); // to paused
    fireEvent.press(screen.getByTestId('resume-button')); // to running
    expect(screen.getByTestId('pause-button')).toBeTruthy();
    expect(screen.getByTestId('stop-button')).toBeTruthy(); // Stop should still be visible
    expect(screen.queryByTestId('resume-button')).toBeNull();
    expect(screen.queryByTestId('start-button')).toBeNull();
  });

  it('should transition from running to initial on Stop press', () => {
    render(<Timer />);
    fireEvent.press(screen.getByTestId('start-button')); // to running
    fireEvent.press(screen.getByTestId('stop-button')); // to stopped, then initial

    // Check for initial state
    expect(screen.getByText('00:00:00')).toBeTruthy();
    expect(screen.getByTestId('start-button')).toBeTruthy();
    expect(screen.queryByTestId('pause-button')).toBeNull();
    expect(screen.queryByTestId('resume-button')).toBeNull();
    expect(screen.queryByTestId('stop-button')).toBeNull(); // Stop button disappears in initial state
  });

  it('should transition from paused to initial on Stop press', () => {
    render(<Timer />);
    fireEvent.press(screen.getByTestId('start-button')); // to running
    fireEvent.press(screen.getByTestId('pause-button')); // to paused
    fireEvent.press(screen.getByTestId('stop-button')); // to stopped, then initial

    // Check for initial state
    expect(screen.getByText('00:00:00')).toBeTruthy();
    expect(screen.getByTestId('start-button')).toBeTruthy();
    expect(screen.queryByTestId('pause-button')).toBeNull();
    expect(screen.queryByTestId('resume-button')).toBeNull();
    expect(screen.queryByTestId('stop-button')).toBeNull();
  });

  it('should call onSessionComplete with a duration when stopped (placeholder)', () => {
    const mockOnSessionComplete = jest.fn();
    render(<Timer onSessionComplete={mockOnSessionComplete} />);
    
    fireEvent.press(screen.getByTestId('start-button')); // Initial -> Running
    fireEvent.press(screen.getByTestId('stop-button')); // Running -> Stopped -> Initial

    expect(mockOnSessionComplete).toHaveBeenCalledTimes(1);
    // For now, we expect it to be called with 0, as per the placeholder Timer component
    expect(mockOnSessionComplete).toHaveBeenCalledWith(0); 
  });
}); 