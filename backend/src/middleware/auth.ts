import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client();

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRATION = '7d'; // 7 days

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        picture: string;
        sub: string;
      };
    }
  }
}

const ALLOWED_EMAILS = ['mathiassiig@gmail.com', 'ajprameswari@gmail.com'];

interface CustomJWTPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
  iat?: number;
  exp?: number;
}

// Function to generate custom JWT token
export const generateCustomToken = (user: {
  email: string;
  name: string;
  picture: string;
  sub: string;
}): string => {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      picture: user.picture,
      sub: user.sub,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

// Function to verify custom JWT token
const verifyCustomToken = (token: string): CustomJWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJWTPayload;
    return decoded;
  } catch (error) {
    console.error('Custom JWT verification error:', error);
    return null;
  }
};

export const verifyGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or malformed authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }

    // First, try to verify as custom JWT token
    const customPayload = verifyCustomToken(token);
    if (customPayload) {
      // Check if email is still in allowed list
      if (!ALLOWED_EMAILS.includes(customPayload.email)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Unauthorized user - access denied' 
        });
      }

      // Attach user info to request
      req.user = {
        email: customPayload.email,
        name: customPayload.name,
        picture: customPayload.picture,
        sub: customPayload.sub,
      };

      return next();
    }

    // If custom JWT verification fails, try Google ID token verification
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        // Add your Google Client ID here if you have one specific to your app
        // audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Invalid token payload' 
        });
      }

      // Check if email is in allowed list
      if (!ALLOWED_EMAILS.includes(payload.email)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Unauthorized user - access denied' 
        });
      }

      // Attach user info to request
      req.user = {
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
        sub: payload.sub || '',
      };

      next();
    } catch (googleError) {
      console.error('Google token verification error:', googleError);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token' 
    });
  }
}; 