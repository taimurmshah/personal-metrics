import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AuthScreen from './AuthScreen';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { User, SignInSuccessResponse, CancelledResponse } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

// Mock the Google Sign-In library
// We cast the mock to the correct type to satisfy TypeScript
const mockGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(), // Will be further mocked in specific tests
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  },
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    // Clear all mock implementations and call counts before each test
    mockGoogleSignin.configure.mockClear();
    mockGoogleSignin.hasPlayServices.mockClear();
    mockGoogleSignin.signIn.mockClear();
  });

  it('renders correctly and shows a Google Sign-In button', () => {
    const { getByTestId, getByText } = render(<AuthScreen />);
    expect(getByText(/Welcome to Meditation App/i)).toBeTruthy();
    expect(getByTestId('google-signin-button')).toBeTruthy();
    expect(getByText(/Sign in with Google/i)).toBeTruthy();
  });

  it('initiates Google Sign-In when the button is pressed and succeeds', async () => {
    // Construct the User object first
    const mockUserData: User = {
      idToken: 'mockIdToken123',
      serverAuthCode: null,
      scopes: ['email', 'profile'],
      user: {
        id: 'mockUserId',
        email: 'test@example.com',
        name: 'Test User',
        photo: 'https://example.com/avatar.png',
        givenName: 'Test',
        familyName: 'User',
      },
    };

    // Wrap the User object in the SignInSuccessResponse structure
    const mockSuccessResponse: SignInSuccessResponse = {
      type: 'success',
      data: mockUserData,
    };

    mockGoogleSignin.signIn.mockResolvedValueOnce(mockSuccessResponse);

    const { getByTestId } = render(<AuthScreen />);
    const signInButton = getByTestId('google-signin-button');

    await act(async () => {
      fireEvent.press(signInButton);
    });

    expect(mockGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1); // Assuming this is called in handleGoogleSignIn
    expect(mockGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    // We would also test navigation or state updates upon successful sign-in
    // For now, we can check console logs if we adapt the component to show success/failure
  });

  it('handles Google Sign-In cancellation', async () => {
    const mockCancelledResponse: CancelledResponse = {
      type: 'cancelled',
      data: null,
    };
    mockGoogleSignin.signIn.mockResolvedValueOnce(mockCancelledResponse);

    const { getByTestId } = render(<AuthScreen />);
    const signInButton = getByTestId('google-signin-button');

    // Spy on console.warn as the component now uses it for user-cancelled sign-in
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Also spy on Alert.alert to ensure the user is notified
    const alertSpy = jest.spyOn(Alert, 'alert');

    await act(async () => {
      fireEvent.press(signInButton);
    });

    expect(mockGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Google Sign-In Cancelled by user.');
    expect(alertSpy).toHaveBeenCalledWith('Sign-In Cancelled', 'You cancelled the Google Sign-In process.');

    consoleWarnSpy.mockRestore();
    alertSpy.mockRestore();
  });

  // Add more tests for other scenarios like no play services, other errors, etc.
  it('handles Play Services not available error', async () => {
    const error: any = new Error('Play Services not available');
    error.code = statusCodes.PLAY_SERVICES_NOT_AVAILABLE;
    // For hasPlayServices, we mock it to throw this error
    mockGoogleSignin.hasPlayServices.mockRejectedValueOnce(error);
    // signIn should not be called in this case

    const { getByTestId } = render(<AuthScreen />);
    const signInButton = getByTestId('google-signin-button');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = jest.spyOn(Alert, 'alert');

    await act(async () => {
      fireEvent.press(signInButton);
    });

    expect(mockGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockGoogleSignin.signIn).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Google Sign-In Error:'),
      expect.objectContaining({ code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE })
    );
    expect(alertSpy).toHaveBeenCalledWith('Play Services Error', 'Google Play Services not available or outdated.');

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
