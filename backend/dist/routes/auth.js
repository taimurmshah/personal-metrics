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
const express_1 = require("express");
const auth_1 = require("../services/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Ensure JWT_SECRET is set in your environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
    process.exit(1); // Exit if JWT secret is not configured
}
router.post('/google', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { googleToken } = req.body; // Expecting token in request body
    if (!googleToken) {
        return res.status(400).json({ error: 'Missing googleToken in request body' });
    }
    try {
        const authResult = yield (0, auth_1.handleGoogleSignIn)(googleToken);
        if (authResult.error || !authResult.user || !authResult.session) {
            // Use the error message from the auth service, or a generic one
            return res.status(401).json({ error: authResult.error || 'Google Sign-In failed' });
        }
        // --- JWT Generation --- 
        // The user is authenticated via Supabase. 
        // Now, generate our own API token (JWT) for subsequent API requests.
        // This token will be used by the iOS client to authenticate with our backend API.
        const apiTokenPayload = {
            userId: authResult.user.id, // Include Supabase user ID
            email: authResult.user.email, // Include email
            // Add any other relevant claims needed for your API
            // exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Example: 24 hour expiry
        };
        const apiToken = jsonwebtoken_1.default.sign(apiTokenPayload, JWT_SECRET, {
        // algorithm: 'HS256', // Default algorithm
        // expiresIn: '1d' // Alternative way to set expiry
        });
        // --- End JWT Generation ---
        // Return the API token to the client
        res.status(200).json({ apiToken: apiToken });
    }
    catch (error) {
        console.error('Error in /auth/google route:', error);
        // Check if it's an error we threw intentionally
        if (error instanceof Error && error.message.includes('unexpected error')) {
            res.status(500).json({ error: 'An unexpected error occurred during authentication.' });
        }
        else {
            // Handle other potential errors (e.g., network issues)
            res.status(500).json({ error: 'Internal Server Error during authentication.' });
        }
    }
}));
exports.default = router;
