import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth'; // Import the auth router
import sessionRouter from './routes/sessions'; // Import the sessions router
import analyticsRouter from './routes/analytics'; // Import the analytics router
import { verifyAuthToken } from './middleware/auth'; // Import auth middleware if needed globally, or apply per route

// Load environment variables from .env file
dotenv.config(); 

// Server setup - Updated to use new ALLOWED_EMAILS env var
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Meditation Tracker Backend!');
});

// Mount the authentication routes
app.use('/api/auth', authRouter);

// TODO: Add routes for sessions (e.g., app.use('/api/sessions', sessionRouter);)
// Mount the sessions routes - apply auth middleware here or within the router file
app.use('/api/sessions', verifyAuthToken, sessionRouter);

// Mount the analytics routes - apply auth middleware
app.use('/api/analytics', verifyAuthToken, analyticsRouter);

// Only start the server for local dev/production environments, not during tests or serverless deployments
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export { app }; // Named export for testing
export default app; 