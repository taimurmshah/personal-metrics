import { Router, Request, Response } from 'express';
import { handleGoogleSignIn } from '../services/auth';
import jwt from 'jsonwebtoken';

const router = Router();

// Ensure JWT_SECRET is set in your environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1); // Exit if JWT secret is not configured
}

router.post('/google', async (req: Request, res: Response) => {
    const { googleToken } = req.body; // Expecting token in request body

    if (!googleToken) {
        res.status(400).json({ error: 'Missing googleToken in request body' });
        return; // Use plain return to exit early
    }

    try {
        const authResult = await handleGoogleSignIn(googleToken);

        if (authResult.error || !authResult.user || !authResult.session) {
            // Use the error message from the auth service, or a generic one
            res.status(401).json({ error: authResult.error || 'Google Sign-In failed' });
            return; // Use plain return to exit early
        }

        // --- Email Allow List Check ---
        const userEmail = authResult.user.email;
        const allowedEmailsEnv = process.env.ALLOWED_EMAILS;

        if (!userEmail) { // Should not happen if Supabase user exists, but good to check
            console.warn('User authenticated but email is missing in authResult.user');
            res.status(403).json({ error: 'Access denied. User email not available.' });
            return;
        }

        if (!allowedEmailsEnv) {
            console.warn('ALLOWED_EMAILS environment variable is not set. Denying all sign-ins as a security precaution.');
            res.status(403).json({ error: 'Access denied. Application not configured for sign-ups at this time.' });
            return;
        }

        const allowedEmails = allowedEmailsEnv.split(',').map(email => email.trim().toLowerCase());

        if (!allowedEmails.includes(userEmail.toLowerCase())) {
            console.warn(`Access denied for email: ${userEmail}. Not in allow list.`);
            res.status(403).json({ error: 'Access denied. This email address is not authorized to use this application.' });
            return;
        }
        // --- End Email Allow List Check ---

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

        const apiToken = jwt.sign(apiTokenPayload, JWT_SECRET, { 
            // algorithm: 'HS256', // Default algorithm
            // expiresIn: '1d' // Alternative way to set expiry
        }); 
        // --- End JWT Generation ---

        // Return the API token to the client
        res.status(200).json({ apiToken: apiToken });

    } catch (error) {
        console.error('Error in /auth/google route:', error);
        // Check if it's an error we threw intentionally
        if (error instanceof Error && error.message.includes('unexpected error')) {
             res.status(500).json({ error: 'An unexpected error occurred during authentication.' });
        } else {
             // Handle other potential errors (e.g., network issues)
             res.status(500).json({ error: 'Internal Server Error during authentication.' });
        }
    }
});

export default router; 