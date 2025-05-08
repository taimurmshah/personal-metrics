import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth'; // Import the auth router
import sessionRouter from './routes/sessions'; // Import the sessions router
import { verifyAuthToken } from './middleware/auth'; // Import auth middleware if needed globally, or apply per route

// Load environment variables from .env file
dotenv.config(); 

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

// In a serverless environment (e.g., Vercel), we export the Express app instance
// and let the platform handle the request listening. For local development,
// we start the server explicitly.

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export default app; 