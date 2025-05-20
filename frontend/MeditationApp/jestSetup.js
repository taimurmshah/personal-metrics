// Jest setup file to mock native modules that are not available in Jest environment

jest.mock('react-native-config', () => ({
  GOOGLE_WEB_CLIENT_ID: 'test-web-client-id',
  GOOGLE_IOS_CLIENT_ID: 'test-ios-client-id',
}));

jest.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSigninButton: () => null,
    GoogleSignin: {
      configure: jest.fn(),
      signIn: jest.fn().mockResolvedValue({}),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      isSignedIn: jest.fn().mockResolvedValue(false),
      signOut: jest.fn().mockResolvedValue(null),
    },
    statusCodes: {},
    isErrorWithCode: () => false,
  };
}); 