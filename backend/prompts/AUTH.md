
Goal:
Implement Google Sign-In token verification middleware for the Fastify backend. This middleware will:

Accept only Bearer tokens that are valid Google ID tokens.

Verify these ID tokens via Google’s public certs (using google-auth-library).

Check that the email is either mathiassiig@gmail.com or ajprameswari@gmail.com — else return HTTP 403.

Attach the decoded token (payload) to request.user for use in route handlers.

Return 401 Unauthorized for missing or malformed tokens.

Return 403 Forbidden if the email is valid Google but not an allowed email.

Required:
Use google-auth-library to validate Google ID tokens.

Make verifyGoogleToken a reusable Fastify plugin (src/plugins/auth.ts) so it can be applied via fastify.register.

Protect all /purchase, /tracked-item, /prediction routes using this auth.

Write unit tests for the auth plugin (with token mocks).

Write example protected route (/protected-test) for manual frontend testing.