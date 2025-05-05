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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../supabaseClient");
const auth_1 = require("../middleware/auth"); // Assuming auth middleware path
const router = (0, express_1.Router)();
// POST /api/sessions - Save a new meditation session
router.post('/', auth_1.verifyAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { session_start_time, duration_seconds } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const { data, error } = yield supabaseClient_1.supabase
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
            return res.status(500).json({ error: 'Failed to save session: No confirmation data returned.' });
        }
        // Respond with success and the new session ID
        res.status(201).json({
            sessionId: data.session_id,
            message: 'Session saved successfully'
        });
    }
    catch (err) {
        console.error('Error saving session:', err);
        res.status(500).json({ error: 'Failed to save session' });
    }
}));
exports.default = router;
