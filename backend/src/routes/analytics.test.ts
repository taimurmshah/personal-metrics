/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../middleware/auth';

// First, set up the mocks
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()
    }))
  }
}));

vi.mock('../middleware/auth', () => ({
  verifyAuthToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // Consistent with sessions.test.ts: cast to any for adding user property in mock
    (req as any).user = { id: 'test-user-id-default-mock', email: 'test-mock@example.com' };
    next();
  }),
}));

// Now import the modules that use the mocks
import { supabase } from '../supabaseClient';
import analyticsRouter from './analytics';

const app: Express = express();
app.use(express.json());
app.use('/api/analytics', analyticsRouter);

describe('GET /api/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (verifyAuthToken as Mock).mockImplementation((req: Request, res: Response, next: NextFunction) => {
      (req as any).user = { id: 'test-user-id', email: 'test@example.com' };
      next();
    });

    // Reset the Supabase mock for each test with proper chaining
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ data: [], error: null })
    });
    
    (supabase.from as Mock).mockImplementation(mockFrom);
  });

  describe('Authentication', () => {
    it('should return 401 if authentication fails', async () => {
      (verifyAuthToken as Mock).mockImplementationOnce((req: Request, res: Response) => {
        res.status(401).json({ message: 'Unauthorized' });
      });
      
      const response = await request(app).get('/api/analytics');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should proceed if token is valid and endpoint is implemented', async () => {
      const response = await request(app).get('/api/analytics?startDate=2023-01-01&endDate=2023-01-07');
      expect(response.status).not.toBe(401);
    });
  });

  describe('Input Validation', () => {
    const invalidQueries = [
      { query: '?endDate=2023-01-07', messageKey: 'startDate.missing' },
      { query: '?startDate=2023-01-01', messageKey: 'endDate.missing' },
      { query: '?startDate=invalid-date&endDate=2023-01-07', messageKey: 'startDate.invalid' },
      { query: '?startDate=2023-01-01&endDate=invalid-date', messageKey: 'endDate.invalid' },
      { query: '?startDate=2023-01-07&endDate=2023-01-01', messageKey: 'endDate.beforeStartDate' },
    ];

    invalidQueries.forEach(testCase => {
      it(`should return 400 for ${testCase.messageKey}`, async () => {
        const response = await request(app).get(`/api/analytics${testCase.query}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(testCase.messageKey);
      });
    });
  });

  describe('Data Aggregation & Logic', () => {
    it('should return aggregated data for a valid date range and user', async () => {
      const mockAggregatedData = [
        { session_start_time: '2023-01-02T10:00:00Z', duration_seconds: 1800 },
        { session_start_time: '2023-01-03T15:30:00Z', duration_seconds: 900 },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue({ data: mockAggregatedData, error: null })
      });
      
      (supabase.from as Mock).mockImplementation(mockFrom);

      const response = await request(app)
        .get('/api/analytics?startDate=2023-01-01&endDate=2023-01-07');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('dailyTotals');
      expect(response.body.summary).toHaveProperty('totalSessions', 2);
      expect(response.body.summary).toHaveProperty('totalMinutes', 45); // (1800 + 900) / 60
      expect(response.body.dailyTotals).toHaveProperty('2023-01-02', 1800);
      expect(response.body.dailyTotals).toHaveProperty('2023-01-03', 900);
    });

    it('should return empty/zeroed data if no sessions found', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue({ data: [], error: null })
      });
      
      (supabase.from as Mock).mockImplementation(mockFrom);
      
      const response = await request(app)
        .get('/api/analytics?startDate=2023-01-01&endDate=2023-01-07');

      expect(response.status).toBe(200);
      expect(response.body.summary).toEqual(expect.objectContaining({
        totalSessions: 0,
        totalMinutes: 0,
        averageMinutesPerDay: 0,
        daysWithSessions: 0,
        adherenceRate: 0,
        currentStreak: 0
      }));
      expect(response.body.dailyTotals).toEqual({});
    });
  });
  
  describe('Error Handling', () => {
    it('should return 500 if there is a database error', async () => {
      const dbError = new Error('DB error');
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue({ data: null, error: dbError })
      });
      
      (supabase.from as Mock).mockImplementation(mockFrom);

      const response = await request(app)
        .get('/api/analytics?startDate=2023-01-01&endDate=2023-01-07');
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch analytics data.');
    });
  });
}); 