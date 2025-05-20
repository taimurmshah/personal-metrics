import axios from 'axios';
import Config from 'react-native-config';
import { getToken } from '../utils/storage'; // Assuming token storage utility

// Placeholder for API service
interface FetchAnalyticsDataParams {
  from: string;
  to: string;
}

interface ApiAnalyticsSummary {
  totalSessions: number;
  totalMinutes: number;
  averageMinutesPerDay: number;
  currentStreak: number;
  adherenceRate: number;
  daysWithSessions: number;
}

interface ApiDailyTotals {
  [date: string]: number;
}

interface ApiAnalyticsResponse {
  summary: ApiAnalyticsSummary;
  dailyTotals: ApiDailyTotals;
  // other potential data
}

export const fetchAnalyticsData = async (params: FetchAnalyticsDataParams): Promise<ApiAnalyticsResponse> => {
  console.log('Fetching analytics data with params:', params);
  const token = await getToken();
  if (!token) {
    console.error('No auth token found for fetchAnalyticsData');
    throw new Error('Authentication required.');
  }

  const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3001'; // Fallback for safety

  try {
    const response = await axios.get<ApiAnalyticsResponse>(`${API_BASE_URL}/api/analytics`, {
      params: {
        from: params.from,
        to: params.to,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 seconds timeout
    });
    
    // The backend currently returns dailyTotals as an object: { "YYYY-MM-DD": minutes }
    // The frontend AnalyticsScreen expects this and transforms it.
    // If the backend changes to return an array, the transformation in AnalyticsScreen must be updated.
    console.log('Successfully fetched analytics data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', JSON.stringify(error, null, 2));
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response Data:', error.response.data);
        console.error('API Error Response Status:', error.response.status);
        let errorMessage = 'Failed to fetch analytics data from server.';
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to access this data.';
        } else if (error.response.data && typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        }
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API No Response:', error.request);
        throw new Error('No response from server. Check network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Request Setup Error:', error.message);
        throw new Error('Error setting up request to fetch analytics data.');
      }
    }
    // Non-Axios error
    throw new Error('An unexpected error occurred while fetching analytics data.');
  }
}; 