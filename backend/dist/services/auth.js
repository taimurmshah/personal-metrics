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
exports.handleGoogleSignIn = handleGoogleSignIn;
const supabaseClient_1 = require("../supabaseClient"); // Import the initialized client
// Google Client ID is still needed for client-side Google Sign-in, 
// but server-side verification might be handled by Supabase directly 
// when using signInWithIdToken. Check Supabase docs for specifics.
// We might still need it if we perform an initial client.verifyIdToken check.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
/**
 * Handles user authentication using a Google ID token via Supabase Auth.
 *
 * @param googleIdToken The ID token received from the frontend Google Sign-In.
 * @returns An object containing the Supabase user and session, or an error.
 * @throws Error if Supabase client interaction fails unexpectedly.
 */
function handleGoogleSignIn(googleIdToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!googleIdToken) {
            return { user: null, session: null, error: 'Google ID token is missing.' };
        }
        // TODO: Optionally, add a primary verification step using google-auth-library 
        //       if needed before passing to Supabase, although Supabase handles verification too.
        // try {
        //     if (!GOOGLE_CLIENT_ID) throw new Error('Google Client ID missing');
        //     const ticket = await client.verifyIdToken({
        //         idToken: googleIdToken,
        //         audience: GOOGLE_CLIENT_ID,
        //     });
        //     const payload = ticket.getPayload();
        //     if (!payload) throw new Error('Invalid token payload');
        //     // Proceed if verification is successful
        // } catch (error) {
        //     console.error('Google token verification failed:', error);
        //     return { user: null, session: null, error: 'Invalid Google ID token.' };
        // }
        try {
            // Use Supabase Auth to sign in with the Google ID token
            // This handles verification, user lookup, and creation automatically.
            const { data, error } = yield supabaseClient_1.supabase.auth.signInWithIdToken({
                provider: 'google',
                token: googleIdToken,
                // Include nonce here if using nonce for replay protection
                // nonce: 'YOUR_NONCE', 
            });
            if (error) {
                console.error('Supabase signInWithIdToken error:', error);
                return { user: null, session: null, error: error.message || 'Supabase authentication failed.' };
            }
            if (!data.session || !data.user) {
                console.error('Supabase signInWithIdToken did not return session or user.');
                return { user: null, session: null, error: 'Authentication incomplete. Missing session or user data.' };
            }
            // Successfully authenticated with Supabase
            console.log('Supabase user authenticated:', data.user.id);
            return { user: data.user, session: data.session };
        }
        catch (error) {
            console.error('Unexpected error during Supabase auth:', error);
            // Re-throw unexpected errors
            if (error instanceof Error) {
                throw new Error(`An unexpected error occurred during Google sign-in: ${error.message}`);
            }
            throw new Error('An unexpected error occurred during Google sign-in.');
        }
    });
}
