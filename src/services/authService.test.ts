import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios'; // Import axios
// Import the actual service
import { handleGoogleSignInResponse } from './authService'; 

// Mock for a potential secure storage utility (FR5)
// We'll assume a function like `storeApiToken` might be called.
// This can be adjusted later based on actual implementation.
vi.mock('@/utils/storage', () => ({
  storeApiToken: vi.fn(),
}));

// Mock axios
vi.mock('axios');

// Define the expected shape of the auth service module
// This helps in setting up tests before the actual module exists.
// interface AuthService {  // We no longer need this mock interface
//   handleGoogleSignInResponse: (googleIdToken: string) => Promise<string | null>;
// }

// Placeholder for the actual module - tests will target this.
// We will need to create src/services/authService.ts later.
// For now, the test will fail until this module and function are implemented.
// let authService: AuthService; // No longer need this

// Dynamically import the service to allow Vitest to mock dependencies beforehand
beforeEach(async () => {
  // Reset mocks before each test
  vi.clearAllMocks();
  // Reset axios mock specifically if needed, or rely on clearAllMocks for vi.mocked(axios)
  // vi.mocked(axios.post).mockReset(); // More specific reset if using typed mocks

  // Simulate dynamic import of the module we are testing
  // In a real scenario, if authService.ts exists, it would be:
  // authService = await import('./authService');
  // For now, we'll define a mock implementation to allow tests to run.
  // authService = { // REMOVE THIS ENTIRE MOCK IMPLEMENTATION
  //   handleGoogleSignInResponse: async (googleIdToken: string) => {
  //     try {
  //       const response = await axios.post('/api/auth/google', { token: googleIdToken });
  //       // await storeApiToken(response.data.apiToken);
  //       return response.data.apiToken;
  //     } catch (error) {
  //       if (axios.isAxiosError(error) && error.response) {
  //         throw new Error(error.response.data.message || 'Backend authentication failed');
  //       } else if (axios.isAxiosError(error)) {
  //         throw new Error(error.message || 'Network request failed');
  //       }
  //       throw error; // Rethrow other unexpected errors
  //     }
  //   }
  // };
});

describe('authService - handleGoogleSignInResponse', () => {
  const mockGoogleIdToken = 'mock-google-id-token-123';
  const mockApiToken = 'mock-api-session-token-789';
  const backendAuthUrl = '/api/auth/google'; // As per FR3/FR4, adjust if different

  it('should send Google ID token to backend via axios and return API token on success', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { apiToken: mockApiToken } });

    const apiToken = await handleGoogleSignInResponse(mockGoogleIdToken); // Use imported function

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(backendAuthUrl, { token: mockGoogleIdToken });
    expect(apiToken).toBe(mockApiToken);
    // expect(storeApiToken).toHaveBeenCalledWith(mockApiToken); // If called directly
  });

  it('should throw an error if backend returns an error response via axios', async () => {
    const errorMessage = 'Invalid Google token';
    const axiosError = {
      isAxiosError: true,
      response: {
        data: { message: errorMessage },
        status: 401,
      },
      message: 'Request failed with status code 401',
    };
    vi.mocked(axios.post).mockRejectedValueOnce(axiosError);

    await expect(handleGoogleSignInResponse(mockGoogleIdToken)) // Use imported function
      .rejects
      .toThrow(errorMessage);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(backendAuthUrl, { token: mockGoogleIdToken });
  });

  it('should throw an error if backend returns a non-standard error message via axios', async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: {}, // Empty data
        status: 500,
      },
      message: 'Request failed with status code 500',
    };
    vi.mocked(axios.post).mockRejectedValueOnce(axiosError);

    await expect(handleGoogleSignInResponse(mockGoogleIdToken)) // Use imported function
      .rejects
      .toThrow('Backend authentication failed'); // This will now test our actual error message

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if axios call fails (network error)', async () => {
    const networkErrorMessage = 'Network request failed';
    const axiosError = {
        isAxiosError: true,
        message: networkErrorMessage,
        // No response object for network errors
    };
    vi.mocked(axios.post).mockRejectedValueOnce(axiosError);

    await expect(handleGoogleSignInResponse(mockGoogleIdToken)) // Use imported function
      .rejects
      .toThrow(networkErrorMessage);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(backendAuthUrl, { token: mockGoogleIdToken });
  });
}); 