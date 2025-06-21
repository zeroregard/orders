import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

// Mock google-auth-library
const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
  };
});

// Import after mocking
import { verifyGoogleToken } from '../middleware/auth';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Express objects
    mockReq = {
      headers: {},
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
  });

  describe('verifyGoogleToken', () => {
    it('should return 401 if no authorization header', async () => {
      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or malformed authorization header'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockReq.headers!.authorization = 'Basic token123';

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or malformed authorization header'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if no token provided after Bearer', async () => {
      mockReq.headers!.authorization = 'Bearer ';

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      mockReq.headers!.authorization = 'Bearer invalid-token';
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token payload is invalid', async () => {
      mockReq.headers!.authorization = 'Bearer valid-token';
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => null,
      });

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token payload'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if email is not in allowed list', async () => {
      mockReq.headers!.authorization = 'Bearer valid-token';
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'unauthorized@example.com',
          name: 'Unauthorized User',
          picture: 'https://example.com/pic.jpg',
          sub: '123456789'
        }),
      });

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Unauthorized user - access denied'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() and attach user info for authorized email', async () => {
      mockReq.headers!.authorization = 'Bearer valid-token';
      const payload = {
        email: 'mathiassiig@gmail.com',
        name: 'Mathias Siig',
        picture: 'https://example.com/pic.jpg',
        sub: '123456789'
      };
      
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        email: 'mathiassiig@gmail.com',
        name: 'Mathias Siig',
        picture: 'https://example.com/pic.jpg',
        sub: '123456789'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should work for the second authorized email', async () => {
      mockReq.headers!.authorization = 'Bearer valid-token';
      const payload = {
        email: 'ajprameswari@gmail.com',
        name: 'AJ Prameswari',
        picture: 'https://example.com/pic2.jpg',
        sub: '987654321'
      };
      
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });

      await verifyGoogleToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        email: 'ajprameswari@gmail.com',
        name: 'AJ Prameswari',
        picture: 'https://example.com/pic2.jpg',
        sub: '987654321'
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 