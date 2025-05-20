import { Router, Request, Response, RequestHandler, ErrorRequestHandler, NextFunction } from 'express';
import { supabase } from '../supabaseClient';
import { verifyAuthToken } from '../middleware/auth';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const router = Router();

// Extend Express Request type to include the 'user' property added by middleware
interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Define the structure of the user object
}

// Define the query parameters type
interface AnalyticsQuery extends ParsedQs {
  startDate?: string;
  endDate?: string;
}

// GET /api/analytics - Get aggregated meditation session analytics
const analyticsHandler: RequestHandler<ParamsDictionary, any, any, AnalyticsQuery> = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: User ID missing after auth.' });
    return;
  }

  const { startDate, endDate } = req.query;

  // Input validation
  if (!startDate || typeof startDate !== 'string') {
    res.status(400).json({ message: 'startDate.missing', error: 'Start date is required and must be a string.' });
    return;
  }

  if (!endDate || typeof endDate !== 'string') {
    res.status(400).json({ message: 'endDate.missing', error: 'End date is required and must be a string.' });
    return;
  }

  // Validate date formats
  if (isNaN(Date.parse(startDate))) {
    res.status(400).json({ message: 'startDate.invalid', error: 'Start date must be a valid ISO date string.' });
    return;
  }

  if (isNaN(Date.parse(endDate))) {
    res.status(400).json({ message: 'endDate.invalid', error: 'End date must be a valid ISO date string.' });
    return;
  }

  // Validate date range
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  if (endDateTime <= startDateTime) {
    res.status(400).json({ message: 'endDate.beforeStartDate', error: 'End date must be after start date.' });
    return;
  }

  // Calculate total number of days in the period.
  // This represents the number of 24-hour intervals between the start of startDate and the start of endDate.
  // If frontend sends startDate='2023-01-01' and endDate='2023-01-08', this correctly results in 7 days (Jan 1 to Jan 7).
  const totalDaysInPeriod = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24);

  // Add maximum date range validation (e.g., 1 year)
  const MAX_DATE_RANGE_DAYS = 365;
  if (totalDaysInPeriod > MAX_DATE_RANGE_DAYS) {
    res.status(400).json({ 
      message: 'dateRange.tooLarge', 
      error: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days.` 
    });
    return;
  }

  try {
    // Query Supabase for meditation sessions within the date range
    const { data, error } = await supabase
      .from('MeditationSessions')
      .select('session_start_time, duration_seconds')
      .eq('user_id', userId)
      .gte('session_start_time', startDate)
      .lte('session_start_time', endDate)
      .order('session_start_time', { ascending: true });

    if (error) {
      console.error(
        JSON.stringify({
          level: 'ERROR',
          message: 'Database error in GET /api/analytics',
          userId,
          queryParameters: { startDate, endDate },
          error: { name: error.name, message: error.message, details: error.details },
          timestamp: new Date().toISOString(),
          source: 'analytics.ts',
        })
      );
      res.status(500).json({ message: 'Failed to fetch analytics data.' });
      return;
    }

    // Process the data into daily aggregates
    const dailyTotals = data?.reduce<Record<string, number>>((acc, session) => {
      const day = session.session_start_time.split('T')[0]; // Get YYYY-MM-DD
      acc[day] = (acc[day] || 0) + session.duration_seconds;
      return acc;
    }, {}) || {};

    // Calculate analytics metrics
    const totalSeconds = Object.values(dailyTotals).reduce((sum, seconds) => sum + seconds, 0);
    const daysWithSessions = Object.keys(dailyTotals).length;
    const averageMinutesPerDay = totalDaysInPeriod ? Math.round((totalSeconds / totalDaysInPeriod / 60) * 10) / 10 : 0; // Round to 1 decimal
    
    // Calculate streak and additional metrics
    const sortedDays = Object.keys(dailyTotals).sort();
    const currentStreak = calculateStreak(sortedDays);
    const longestStreak = calculateLongestStreak(sortedDays);
    const totalMinutes = Math.round(totalSeconds / 60);

    res.status(200).json({
      startDate,
      endDate,
      summary: {
        totalMinutes,
        averageMinutesPerDay,
        daysWithSessions,
        currentStreak,
        longestStreak
      },
      dailyTotals
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'Error in GET /api/analytics',
        userId,
        queryParameters: { startDate, endDate },
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
        timestamp: new Date().toISOString(),
        source: 'analytics.ts',
      })
    );
    res.status(500).json({ message: 'Failed to process analytics request.' });
  }
};

// Error handler for this route
const errorHandler: ErrorRequestHandler = (err, req, res, next): void => {
  console.error(
    JSON.stringify({
      level: 'ERROR',
      message: 'Unhandled error in analytics route',
      error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : String(err),
      timestamp: new Date().toISOString(),
      source: 'analytics.ts',
    })
  );
  res.status(500).json({ message: 'Internal server error.' });
};

router.get('/', verifyAuthToken, analyticsHandler);
router.use(errorHandler);

export default router;

// Helper function to calculate current streak
function calculateStreak(sortedDays: string[]): number {
  if (!sortedDays.length) return 0;
  
  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  const lastDay = sortedDays[sortedDays.length - 1];
  
  // If last meditation wasn't today or yesterday, streak is 0
  if (lastDay < today && lastDay < getPreviousDay(today)) {
    return 0;
  }
  
  // Count consecutive days backwards
  for (let i = sortedDays.length - 1; i > 0; i--) {
    const currentDay = new Date(sortedDays[i]);
    const previousDay = new Date(sortedDays[i - 1]);
    const dayDifference = (currentDay.getTime() - previousDay.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDifference === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper function to get previous day's date string
function getPreviousDay(dateString: string): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

// Helper function to calculate longest streak
function calculateLongestStreak(sortedDaysWithSessions: string[]): number {
  if (!sortedDaysWithSessions || sortedDaysWithSessions.length === 0) {
    return 0;
  }

  let longestStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedDaysWithSessions.length; i++) {
    const currentDay = new Date(sortedDaysWithSessions[i]);
    
    if (i === 0) { // First day in the list
      currentStreak = 1;
    } else {
      const previousDay = new Date(sortedDaysWithSessions[i - 1]);
      const diffInDays = (currentDay.getTime() - previousDay.getTime()) / (1000 * 60 * 60 * 24);

      if (diffInDays === 1) {
        currentStreak++;
      } else {
        // Streak broken, reset current streak
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        currentStreak = 1; // Start new streak
      }
    }
  }

  // Final check for the last streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return longestStreak;
} 