import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface SessionData {
  session_start_time: string; // ISO8601 string
  duration_seconds: number;
}

interface SaveSessionResponse {
  sessionId: string;
  message: string;
}

/**
 * Saves a meditation session to the backend.
 * @param sessionData The data for the session.
 * @param token The user's API token.
 * @returns Promise resolving to the backend response.
 * @throws Throws an error if the API call fails.
 */
export const saveSession = async (
  sessionData: SessionData,
  token: string
): Promise<SaveSessionResponse> => {
  try {
    const response = await axios.post<SaveSessionResponse>(
      `${API_BASE_URL}/sessions`,
      sessionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.info(JSON.stringify({
      level: 'INFO',
      message: 'Session saved successfully',
      sessionId: response.data.sessionId,
      requestId: response.headers['x-request-id'], // Assuming backend provides this
    }));    
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to save session due to an unknown error.';
    let errorDetails: any = {};

    // Check if it's an Axios error by looking for characteristic properties
    // and using the type predicate if available and recognized.
    if (error && typeof error === 'object' && 'isAxiosError' in error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError; // Type assertion
      errorMessage = axiosError.response?.data?.error || axiosError.message || 'Network request failed';
      errorDetails = {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: axiosError.config,
      };
      console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Axios error saving session',
        errorMessage: errorMessage,
        userId: 'TODO_GET_USER_ID', // Placeholder, should be populated if available
        url: `${API_BASE_URL}/sessions`,
        method: 'POST',
        details: errorDetails,
        stack: axiosError.stack,
      }));
    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Generic error saving session',
        errorMessage: errorMessage,
        userId: 'TODO_GET_USER_ID', // Placeholder
        details: error,
        stack: error.stack,
      }));
    } else {
      console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Non-error object thrown saving session',
        details: error,
        userId: 'TODO_GET_USER_ID', // Placeholder
      }));
    }
    // Re-throw a more specific error or the original error for the caller to handle
    // For now, just re-throwing the error, but could be a custom error type.
    throw new Error(errorMessage); 
  }
}; 