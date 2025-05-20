import 'express';

// Define a new interface for our authenticated request
interface AuthenticatedUser {
  id: string;
  email?: string; // Or other properties your JWT/auth middleware adds
}

declare global {
  namespace Express {
    export interface Request {
      user?: AuthenticatedUser;
    }
  }
} 