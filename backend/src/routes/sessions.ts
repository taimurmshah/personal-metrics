import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { verifyAuthToken } from '../middleware/auth'; // Assuming auth middleware path

const router = Router();

// Extend Express Request type to include the 'user' property added by middleware
interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Define the structure of the user object
}

// POST /api/sessions - Save a new meditation session
router.post('/', verifyAuthToken, async (req: AuthenticatedRequest, res: Response) => {
  const { session_start_time, duration_seconds } = req.body;
  const userId = req.user?.id;

  // Basic validation
  if (!session_start_time || typeof session_start_time !== 'string' || isNaN(Date.parse(session_start_time))) {
    return res.status(400).json({ error: 'Invalid session data: session_start_time is required and must be a valid ISO string.' });
  }
  if (duration_seconds == null || typeof duration_seconds !== 'number' || duration_seconds <= 0) {
    return res.status(400).json({ error: 'Invalid session data: duration_seconds is required and must be a positive number.' });
  }
  if (!userId) {
     // This should technically be caught by verifyAuthToken, but belt-and-suspenders
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    // Calculate end_time based on start_time and duration
    const startTime = new Date(session_start_time);
    const endTime = new Date(startTime.getTime() + duration_seconds * 1000);

    const { data, error } = await supabase
      .from('MeditationSessions')
      .insert([
        {
          user_id: userId,
          session_start_time: session_start_time,
          duration_seconds: duration_seconds,
          session_end_time: endTime.toISOString(), // Store calculated end time
        },
      ])
      .select('session_id') // Select the generated session_id
      .single(); // Expecting a single record insertion

    if (error) {
      console.error('Supabase insertion error:', error);
      return res.status(500).json({ error: 'Failed to save session' });
    }

    if (!data) {
        console.error('Supabase insertion returned no data despite no error.');
        return res.status(500).json({ error: 'Failed to save session: No confirmation data returned.' })
    }

    // Respond with success and the new session ID
    res.status(201).json({ 
        sessionId: data.session_id, 
        message: 'Session saved successfully' 
    });

  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

export default router; 