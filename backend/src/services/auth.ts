import { OAuth2Client } from 'google-auth-library';
import { SupabaseClient, User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient'; // Import the initialized client
import jwt from 'jsonwebtoken';

// Google Client ID is still needed for client-side Google Sign-in, 
// but server-side verification might be handled by Supabase directly 
// when using signInWithIdToken. Check Supabase docs for specifics.
// We might still need it if we perform an initial client.verifyIdToken check.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
// const client = new OAuth2Client(GOOGLE_CLIENT_ID); // Keep or remove depending on final strategy

// Define a simpler return type, focusing on the session/user from Supabase
type AuthResult = {
    user: SupabaseUser | null;
    session: SupabaseSession | null;
    error?: string; // Optional error message
};

/**
 * Handles user authentication using a Google ID token via Supabase Auth.
 * 
 * @param googleIdToken The ID token received from the frontend Google Sign-In.
 * @returns An object containing the Supabase user and session, or an error.
 * @throws Error if Supabase client interaction fails unexpectedly.
 */
export async function handleGoogleSignIn(googleIdToken: string): Promise<AuthResult> {
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
        // Decode the JWT to check for a `nonce` claim. Supabase requires that
        // if a nonce exists in the ID token, the **exact same** value must be
        // provided in the `nonce` parameter. If the token has no nonce claim,
        // `nonce` **must not** be passed.

        // `jwt.decode` does not verify the signature – we are only inspecting
        // the payload to read the optional `nonce` value.
        const decoded = jwt.decode(googleIdToken) as { [key: string]: unknown } | null;
        const nonceClaim = decoded && typeof decoded === 'object' ? decoded['nonce'] : undefined;

        // Build params for Supabase call. Conditionally include `nonce` only
        // when it exists in the ID token.
        const signInParams: Parameters<typeof supabase.auth.signInWithIdToken>[0] = {
            provider: 'google',
            token: googleIdToken,
            ...(nonceClaim ? { nonce: String(nonceClaim) } : {}),
        };

        // Use Supabase Auth to sign in with the Google ID token.
        // Supabase handles verification, user lookup, and creation.
        const { data, error } = await supabase.auth.signInWithIdToken(signInParams);

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

    } catch (error) {
        console.error('Unexpected error during Supabase auth:', error);
        // Re-throw unexpected errors
        if (error instanceof Error) {
             throw new Error(`An unexpected error occurred during Google sign-in: ${error.message}`);
        }
        throw new Error('An unexpected error occurred during Google sign-in.');
    }
} 