import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include the 'user' property 
interface AuthenticatedRequest extends Request {
  user?: { id: string }; 
}

// Placeholder authentication middleware
export const verifyAuthToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In a real scenario, you would verify a token (e.g., JWT) from the Authorization header
  // and fetch user details. For now, we'll simulate a successful authentication.
  console.warn('Auth Middleware: Using placeholder - Attaching dummy user.');
  
  // Simulate finding a user based on a token
  req.user = { id: 'placeholder-user-id' }; // Use a distinct ID for placeholder

  // Ensure the token is valid (placeholder check)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     console.warn('Auth Middleware: No Bearer token found.');
     // For placeholder, allow request to proceed, but log it.
     // In real implementation, return 401 here.
     // return res.status(401).json({ error: 'Missing or invalid Bearer token' });
  }
  
  next(); // Pass control to the next middleware or route handler
}; 