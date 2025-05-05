"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const supabaseClient_1 = require("../supabaseClient"); // This will be the mocked version
const auth_1 = require("../middleware/auth"); // Import the mocked function
// --- Mock Setup ---
// No top-level mock variables needed here anymore
vitest_1.vi.mock('../supabaseClient', () => {
    // Define the mock structure directly, including chained methods
    const mockSingleFn = vitest_1.vi.fn();
    const mockSelectFn = vitest_1.vi.fn(() => ({ single: mockSingleFn }));
    const mockInsertFn = vitest_1.vi.fn(() => ({ select: mockSelectFn }));
    const mockFromFn = vitest_1.vi.fn(() => ({ insert: mockInsertFn }));
    return {
        supabase: {
            from: mockFromFn,
            auth: {
                getUser: vitest_1.vi.fn(),
            },
        },
    };
});
vitest_1.vi.mock('../middleware/auth', () => ({
    verifyAuthToken: vitest_1.vi.fn((req, res, next) => {
        req.user = { id: 'test-user-id' };
        next();
    }),
}));
(0, vitest_1.describe)('POST /api/sessions', () => {
    (0, vitest_1.beforeEach)(() => {
        // Reset all mocks
        vitest_1.vi.clearAllMocks();
        // We now need to access the mocks via the imported supabase object
        // Reset specific mocks if needed (though clearAllMocks usually suffices)
        // const mockedSupabase = supabase as unknown as { from: ReturnType<typeof vi.fn> };
        // const mockInsert = mockedSupabase.from('').insert as ReturnType<typeof vi.fn>;
        // mockInsert.mockClear(); 
        // (supabase.from as ReturnType<typeof vi.fn>).mockClear();
    });
    (0, vitest_1.it)('should return 201 Created and save the session for a valid request', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange: Setup default success mock state via the mocked supabase chain
        // Access the final function in the chain to set the resolved value
        const mockSingle = supabaseClient_1.supabase.from('').insert([]).select('').single;
        mockSingle.mockResolvedValue({ data: { session_id: 'mock-session-id' }, error: null });
        const sessionData = {
            session_start_time: new Date().toISOString(),
            duration_seconds: 600,
        };
        // Act
        const response = yield (0, supertest_1.default)(server_1.app)
            .post('/api/sessions')
            .set('Authorization', 'Bearer valid-token')
            .send(sessionData);
        // Assert
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body).toHaveProperty('sessionId');
        (0, vitest_1.expect)(response.body.message).toBe('Session saved successfully');
        // Assert calls on the mocks obtained via supabase import
        (0, vitest_1.expect)(supabaseClient_1.supabase.from).toHaveBeenCalledWith('MeditationSessions');
        (0, vitest_1.expect)(supabaseClient_1.supabase.from('MeditationSessions').insert).toHaveBeenCalledWith([{
                user_id: 'test-user-id',
                session_start_time: sessionData.session_start_time,
                duration_seconds: sessionData.duration_seconds,
                session_end_time: vitest_1.expect.any(String)
            }]);
    }));
    (0, vitest_1.it)('should return 400 Bad Request if session_start_time is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const sessionData = {
            duration_seconds: 600,
        };
        // Get the mock insert function to assert it wasn't called
        const mockInsert = supabaseClient_1.supabase.from('').insert;
        // Act
        const response = yield (0, supertest_1.default)(server_1.app)
            .post('/api/sessions')
            .set('Authorization', 'Bearer valid-token')
            .send(sessionData);
        // Assert
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body.error).toContain('session_start_time is required');
        (0, vitest_1.expect)(mockInsert).not.toHaveBeenCalled();
    }));
    (0, vitest_1.it)('should return 400 Bad Request if duration_seconds is missing or invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const sessionData = {
            session_start_time: new Date().toISOString(),
        };
        const mockInsert = supabaseClient_1.supabase.from('').insert;
        // Act
        const response = yield (0, supertest_1.default)(server_1.app)
            .post('/api/sessions')
            .set('Authorization', 'Bearer valid-token')
            .send(sessionData);
        // Assert
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body.error).toContain('duration_seconds is required');
        (0, vitest_1.expect)(mockInsert).not.toHaveBeenCalled();
    }));
    (0, vitest_1.it)('should return 401 Unauthorized if Authorization header simulation fails', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange: Override the auth mock using mockImplementationOnce
        const mockedVerifyAuthToken = vitest_1.vi.mocked(auth_1.verifyAuthToken); // Get typed mock
        mockedVerifyAuthToken.mockImplementationOnce((req, res, next) => {
            res.status(401).json({ error: 'Missing or invalid token' });
            // No next() - This prevents the actual route handler from being called
        });
        const sessionData = {
            session_start_time: new Date().toISOString(),
            duration_seconds: 600,
        };
        // Act
        const response = yield (0, supertest_1.default)(server_1.app)
            .post('/api/sessions')
            .send(sessionData);
        // Assert
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(response.body.error).toContain('Missing or invalid token');
        // Verify insert was not called
        const mockInsert = supabaseClient_1.supabase.from('').insert;
        (0, vitest_1.expect)(mockInsert).not.toHaveBeenCalled();
        // No need for vi.restoreAllMocks() when using mockImplementationOnce
    }));
    (0, vitest_1.it)('should return 500 Internal Server Error if database insertion fails', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange: Set up Supabase mock chain to return an error at the end
        const mockSingle = supabaseClient_1.supabase.from('').insert([]).select('').single;
        const dbError = new Error('Database connection failed');
        mockSingle.mockResolvedValue({ data: null, error: dbError });
        const sessionData = {
            session_start_time: new Date().toISOString(),
            duration_seconds: 600,
        };
        // Act
        const response = yield (0, supertest_1.default)(server_1.app)
            .post('/api/sessions')
            .set('Authorization', 'Bearer valid-token')
            .send(sessionData);
        // Assert
        (0, vitest_1.expect)(response.status).toBe(500);
        (0, vitest_1.expect)(response.body.error).toBe('Failed to save session');
        (0, vitest_1.expect)(supabaseClient_1.supabase.from).toHaveBeenCalledWith('MeditationSessions');
        (0, vitest_1.expect)(supabaseClient_1.supabase.from('MeditationSessions').insert).toHaveBeenCalled(); // It was called
        (0, vitest_1.expect)(supabaseClient_1.supabase.from('').insert([]).select).toHaveBeenCalled(); // select was called
        (0, vitest_1.expect)(supabaseClient_1.supabase.from('').insert([]).select('').single).toHaveBeenCalled(); // single was called
    }));
});
