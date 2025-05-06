import React from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes, isErrorWithCode, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import type { User, SignInResponse } from '@react-native-google-signin/google-signin'; // Import types

// Placeholder for Google Sign-In functions if needed directly in the component
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

const AuthScreen: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Configuration can be done once, e.g., when the component mounts
    // You might need to add your webClientId and iosClientId here if you have them
    GoogleSignin.configure({
      // webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      // iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      scopes: ['email', 'profile'], // Add scopes you need
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Checking for Play Services...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('Attempting Google Sign-In...');
      const response: SignInResponse = await GoogleSignin.signIn();
      console.log('Google Sign-In Response:', response);

      if (response.type === 'success') {
        const userInfo: User = response.data;
        console.log('User Info:', userInfo);
        Alert.alert('Sign-In Success', `Welcome ${userInfo.user.name || userInfo.user.email}`);
        // TODO: Send userInfo.idToken to your backend for verification & session creation
      } else if (response.type === 'cancelled') {
        console.warn('Google Sign-In Cancelled by user.');
        Alert.alert('Sign-In Cancelled', 'You cancelled the Google Sign-In process.');
      } else {
        // Should not happen if types are exhaustive, but as a fallback
        console.error('Google Sign-In Error: Unexpected response type', response);
        Alert.alert('Sign-In Error', 'An unexpected error occurred during sign-in.');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED: // Already handled by response.type === 'cancelled' if signIn resolves
            Alert.alert('Sign-In Cancelled', 'You cancelled the Google Sign-In process.');
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert('Sign-In Progress', 'Sign-in is already in progress.');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Play Services Error', 'Google Play Services not available or outdated.');
            break;
          default:
            Alert.alert('Sign-In Error', `An error occurred: ${error.message} (Code: ${error.code})`);
        }
      } else {
        Alert.alert('Sign-In Error', `An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ marginBottom: 20 }}>Welcome to Meditation App</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          testID="google-signin-button"
        />
      )}
    </View>
  );
};

export default AuthScreen;
