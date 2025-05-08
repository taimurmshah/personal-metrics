import React from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes, isErrorWithCode, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import type { User, SignInResponse } from '@react-native-google-signin/google-signin'; // Import types
import Config from 'react-native-config'; // Import react-native-config
import axios from 'axios'; // Import axios
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Placeholder for Google Sign-In functions if needed directly in the component
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

const AuthScreen: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { login } = useAuth(); // Get login function from context

  // Backend API endpoint for Google authentication
  const BACKEND_AUTH_URL = 'YOUR_BACKEND_BASE_URL/api/auth/google'; // <-- REPLACE WITH ACTUAL URL

  React.useEffect(() => {
    // Configuration can be done once, e.g., when the component mounts
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID, // Read from .env via react-native-config
      iosClientId: Config.GOOGLE_IOS_CLIENT_ID, // Read from .env via react-native-config
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

        if (!userInfo.idToken) {
          throw new Error('Google Sign-In succeeded but idToken is missing.');
        }

        // --- Backend Authentication --- 
        try {
          console.log('Sending token to backend...');
          const backendResponse = await axios.post(BACKEND_AUTH_URL, {
            googleToken: userInfo.idToken,
          });

          if (backendResponse.data && backendResponse.data.apiToken) {
            const apiToken = backendResponse.data.apiToken;
            console.log('Backend authentication successful, received API token.');
            // Use the login function from AuthContext to save token and update state
            await login(apiToken);
            // Navigation will happen automatically due to state change in App.tsx
            Alert.alert('Sign-In Success', `Welcome ${userInfo.user.name || userInfo.user.email}`);

          } else {
            throw new Error('Backend response missing apiToken.');
          }

        } catch (backendError: any) {
          console.error('Backend Authentication Error:', backendError);
          const errorMessage = axios.isAxiosError(backendError) && backendError.response?.data?.error
             ? backendError.response.data.error
             : backendError.message;
          Alert.alert('Backend Error', `Failed to authenticate with server: ${errorMessage}`);
          // Optionally logout from Google if backend fails?
          // await GoogleSignin.signOut(); 
        }
        // --- End Backend Authentication ---

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
            // Check if it's the URL scheme error we saw before
            if (error.message.includes('missing support for the following URL schemes')) {
              Alert.alert('Configuration Error', 'URL scheme configuration is missing or incorrect. Please check Info.plist.');
            } else {
              Alert.alert('Sign-In Error', `An error occurred: ${error.message} (Code: ${error.code})`);
            }
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
