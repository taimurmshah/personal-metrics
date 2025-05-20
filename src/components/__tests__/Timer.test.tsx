import React from 'react';
import { render } from '@testing-library/react-native';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Timer from '../Timer';
import type { UseTimerReturn } from '../../hooks/useTimer';

// Mock the useTimer hook
const mockUseTimer = vi.fn();
vi.mock('../../hooks/useTimer', () => ({
  useTimer: () => mockUseTimer(),
}));

// Mock GlowButton as it's a child component with its own tests
vi.mock('../GlowButton', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, Text } = require('react-native');
  return {
    default: ({ label, testID, onPress, size }: any) => (
      <View testID={testID || 'mock-glow-button'} onTouchEnd={onPress}>
        <Text>{label}{size ? ` (${size})` : ''}</Text>
      </View>
    ),
  };
});

describe('Timer component snapshots', () => {
  const baseMockTimerReturn: UseTimerReturn = {
    time: 0,
    status: 'initial',
    saveStatus: 'idle',
    handleStart: vi.fn(),
    handlePause: vi.fn(),
    handleResume: vi.fn(),
    handleStop: vi.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTimer.mockReturnValue(baseMockTimerReturn);
  });

  it('should match snapshot in initial state', () => {
    mockUseTimer.mockReturnValue({ ...baseMockTimerReturn, status: 'initial', time: 0 });
    const tree = render(<Timer />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot when running', () => {
    mockUseTimer.mockReturnValue({ ...baseMockTimerReturn, status: 'running', time: 125 });
    const tree = render(<Timer />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot when paused', () => {
    mockUseTimer.mockReturnValue({ ...baseMockTimerReturn, status: 'paused', time: 300 });
    const tree = render(<Timer />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot when saving session', () => {
    mockUseTimer.mockReturnValue({ ...baseMockTimerReturn, status: 'initial', saveStatus: 'saving' });
    const tree = render(<Timer />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot on successful save', () => {
    mockUseTimer.mockReturnValue({ ...baseMockTimerReturn, status: 'initial', saveStatus: 'success' });
    const tree = render(<Timer />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot on save error', () => {
    mockUseTimer.mockReturnValue({ ...baseMockTimerReturn, status: 'initial', saveStatus: 'error' });
    const tree = render(<Timer />).toJSON();
    expect(tree).toMatchSnapshot();
  });
}); 