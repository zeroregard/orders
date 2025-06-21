import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

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

    // Verify the token with Google
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
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token' 
    });
  }
}; 