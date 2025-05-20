import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include the 'user' property 
interface AuthenticatedRequest extends Request {
  user?: { id: string }; 
}

// Authentication middleware
export const verifyAuthToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Verify a token (e.g., JWT) from the Authorization header and fetch user details
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     console.warn('Auth Middleware: No Bearer token found.');
     res.status(401).json({ error: 'Missing or invalid Bearer token' });
     return; // Explicitly return void after sending response
  }

  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error(JSON.stringify({ level: 'FATAL', message: 'JWT_SECRET not set in environment', source: 'verifyAuthToken' }));
    res.status(500).json({ error: 'Server configuration error' });
    return; // Explicitly return void after sending response
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };

    if (!decoded || !decoded.userId) {
      console.warn(JSON.stringify({ level: 'WARN', message: 'Decoded token missing userId', source: 'verifyAuthToken' }));
      res.status(401).json({ error: 'Invalid token payload' });
      return; // Explicitly return void after sending response
    }

    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    console.error(JSON.stringify({ level: 'ERROR', message: 'Token verification failed', source: 'verifyAuthToken', error: err instanceof Error ? err.message : err }));
    res.status(401).json({ error: 'Invalid token' });
    // No explicit return needed here, end of function path after sending response
  }
}; 