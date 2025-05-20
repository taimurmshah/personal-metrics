import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import TimerScreen from '../TimerScreen';

// @ts-nocheck

// Mock child components and hooks to isolate TimerScreen for snapshot testing
jest.mock('../../../../../src/components/Timer', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  return {
    default: () => <View testID="mock-timer" />, // Simple mock
  };
});

// Mock react-native Image component
jest.mock('react-native', () => {
  const RN: any = jest.requireActual('react-native');
  return {
    ...RN,
    Image: (props: any) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { View } = require('react-native');
      // Accessing source like this might be fragile if source prop changes.
      // Consider a more robust way if direct source access is needed for tests.
      // For a simple snapshot, just rendering a placeholder is often enough.
      const source = typeof props.source === 'number' ? { uri: `image-mock-${props.source}` } : props.source;
      return <View testID="mock-image" source={source} style={props.style} resizeMode={props.resizeMode} />;
    },
     // Mock SafeAreaView as a simple View for testing purposes
     SafeAreaView: (props: any) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { View } = require('react-native');
      return <View {...props} testID="mock-safe-area-view">{props.children}</View>;
    }
  };
});

// Mock @react-navigation/native
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...(jest.requireActual('@react-navigation/native') as any),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock WeeklySummary component
jest.mock('../../../../../src/components/WeeklySummary', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  return {
    default: () => <View testID="mock-weekly-summary" />,
  };
});

describe('TimerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<TimerScreen />); // Destructure toJSON directly
    expect(toJSON()).toMatchSnapshot(); // Call toJSON as a function
  });

  it('should call navigation.navigate with "Analytics" when Weekly Summary panel is pressed', () => {
    const { getByTestId } = render(<TimerScreen />);
    const panel = getByTestId('weekly-summary-panel');
    fireEvent.press(panel);
    expect(mockNavigate).toHaveBeenCalledWith('Analytics');
  });
}); 