import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { supabase } from '../supabaseClient'; // This will be the mocked version
import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../middleware/auth'; // Import the mocked function

// --- Mock Setup ---
// No top-level mock variables needed here anymore

vi.mock('../supabaseClient', () => {
  // Define the mock structure directly, including chained methods
  const mockSingleFn = vi.fn();
  const mockSelectFn = vi.fn(() => ({ single: mockSingleFn }));
  const mockInsertFn = vi.fn(() => ({ select: mockSelectFn }));
  const mockFromFn = vi.fn(() => ({ insert: mockInsertFn }));

  return {
    supabase: {
      from: mockFromFn,
      auth: {
        getUser: vi.fn(),
      },
    },
  };
});

vi.mock('../middleware/auth', () => ({
  verifyAuthToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: 'test-user-id' };
    next();
  }),
}));

describe('POST /api/sessions', () => {

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // We now need to access the mocks via the imported supabase object
    // Reset specific mocks if needed (though clearAllMocks usually suffices)
    // const mockedSupabase = supabase as unknown as { from: ReturnType<typeof vi.fn> };
    // const mockInsert = mockedSupabase.from('').insert as ReturnType<typeof vi.fn>;
    // mockInsert.mockClear(); 
    // (supabase.from as ReturnType<typeof vi.fn>).mockClear();

  });

  it('should return 201 Created and save the session for a valid request', async () => {
    // Arrange: Setup default success mock state via the mocked supabase chain
    // Access the final function in the chain to set the resolved value
    const mockSingle = supabase.from('').insert([]).select('').single as ReturnType<typeof vi.fn>; 
    mockSingle.mockResolvedValue({ data: { session_id: 'mock-session-id' }, error: null });

    const sessionData = {
      session_start_time: new Date().toISOString(),
      duration_seconds: 600,
    };

    // Act
    const response = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer valid-token')
      .send(sessionData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('sessionId');
    expect(response.body.message).toBe('Session saved successfully');
    // Assert calls on the mocks obtained via supabase import
    expect(supabase.from).toHaveBeenCalledWith('MeditationSessions');
    expect(supabase.from('MeditationSessions').insert).toHaveBeenCalledWith([{
        user_id: 'test-user-id',
        session_start_time: sessionData.session_start_time,
        duration_seconds: sessionData.duration_seconds,
        session_end_time: expect.any(String)
    }]);
  });

  it('should return 400 Bad Request if session_start_time is missing', async () => {
    // Arrange
    const sessionData = {
      duration_seconds: 600,
    };
     // Get the mock insert function to assert it wasn't called
    const mockInsert = (supabase.from('').insert as ReturnType<typeof vi.fn>);

    // Act
    const response = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer valid-token')
      .send(sessionData);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('session_start_time is required');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should return 400 Bad Request if duration_seconds is missing or invalid', async () => {
    // Arrange
    const sessionData = {
      session_start_time: new Date().toISOString(),
    };
    const mockInsert = (supabase.from('').insert as ReturnType<typeof vi.fn>);

    // Act
    const response = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer valid-token')
      .send(sessionData);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('duration_seconds is required');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should return 401 Unauthorized if Authorization header simulation fails', async () => {
    // Arrange: Override the auth mock using mockImplementationOnce
    const mockedVerifyAuthToken = vi.mocked(verifyAuthToken); // Get typed mock
    mockedVerifyAuthToken.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
       res.status(401).json({ error: 'Missing or invalid token' });
       // No next() - This prevents the actual route handler from being called
    });

    const sessionData = {
      session_start_time: new Date().toISOString(),
      duration_seconds: 600,
    };

    // Act
    const response = await request(app)
      .post('/api/sessions')
      .send(sessionData);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Missing or invalid token');
    // Verify insert was not called
    const mockInsert = supabase.from('').insert as ReturnType<typeof vi.fn>; 
    expect(mockInsert).not.toHaveBeenCalled();

    // No need for vi.restoreAllMocks() when using mockImplementationOnce
  });

  it('should return 500 Internal Server Error if database insertion fails', async () => {
    // Arrange: Set up Supabase mock chain to return an error at the end
    const mockSingle = supabase.from('').insert([]).select('').single as ReturnType<typeof vi.fn>; 
    const dbError = new Error('Database connection failed');
    mockSingle.mockResolvedValue({ data: null, error: dbError });

    const sessionData = {
      session_start_time: new Date().toISOString(),
      duration_seconds: 600,
    };

    // Act
    const response = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer valid-token')
      .send(sessionData);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to save session');
    expect(supabase.from).toHaveBeenCalledWith('MeditationSessions');
    expect(supabase.from('MeditationSessions').insert).toHaveBeenCalled(); // It was called
    expect(supabase.from('').insert([]).select).toHaveBeenCalled(); // select was called
    expect(supabase.from('').insert([]).select('').single).toHaveBeenCalled(); // single was called
  });

}); 