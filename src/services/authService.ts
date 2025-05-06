import axios from 'axios';

interface BackendAuthResponse {
  apiToken: string;
  // Add other expected fields from the backend if any
}

/**
 * Sends the Google ID token to the backend for verification and retrieves an API session token.
 * @param googleIdToken The ID token received from Google Sign-In.
 * @returns A promise that resolves with the API session token.
 * @throws Will throw an error if the backend request fails or returns an error.
 */
export const handleGoogleSignInResponse = async (googleIdToken: string): Promise<string> => {
  try {
    // The tests in authService.test.ts mock this endpoint.
    // Ensure this matches the actual backend endpoint.
    const response = await axios.post<BackendAuthResponse>('/api/auth/google', {
      token: googleIdToken,
    });

    if (response.data && response.data.apiToken) {
      return response.data.apiToken;
    } else {
      console.error(
        JSON.stringify({
          level: 'ERROR',
          message: 'Invalid response structure from backend auth',
          responseData: response.data,
          timestamp: new Date().toISOString(),
        })
      );
      throw new Error('Invalid response structure from backend auth.');
    }
  } catch (error) {
    // Simplified check for Axios-like error
    if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).isAxiosError) {
      const axiosError = error as any; // Temporary cast to any to access properties

      console.error(
        JSON.stringify({
          level: 'ERROR',
          message: 'Error sending Google ID token to backend',
          errorMessage: axiosError.message,
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          // Avoid logging axiosError.config?.data directly if it might contain sensitive tokens
          requestConfigured: !!axiosError.config,
          responseStatus: axiosError.response?.status,
          responseData: axiosError.response?.data,
          timestamp: new Date().toISOString(),
        })
      );

      if (axiosError.response) {
        const backendMessage = axiosError.response.data?.message;
        if (typeof backendMessage === 'string' && backendMessage) {
          throw new Error(backendMessage);
        } else {
          throw new Error(`Backend authentication failed with status: ${axiosError.response.status}`);
        }
      } else if (axiosError.request) {
        throw new Error('No response from backend authentication service.');
      } else {
        throw new Error(`Error during backend authentication: ${axiosError.message}`);
      }
    } else {
      // Handle non-Axios errors or other unexpected errors
      console.error(
        JSON.stringify({
          level: 'ERROR',
          message: 'An unexpected error occurred during Google Sign-In',
          errorObject: String(error), // Convert error to string for logging
          timestamp: new Date().toISOString(),
        })
      );
      throw new Error('An unexpected error occurred during Google Sign-In.');
    }
  }
}; 