Goal:
Integrate Google Sign-In using the Google Identity Services library. After sign-in:

Get the Google ID Token (not access token) from the user’s Google login.

Store the ID Token in React state (or context) and in-memory — no localStorage or cookies for now.

Send this ID Token as a Bearer token in the Authorization header for all API requests to the backend.

Handle backend 401/403 responses by showing an appropriate UI error message (“Not signed in” or “Unauthorized user”).

Add a simple “Sign In with Google” button to the main page.

Auto-refresh token if Google Identity Services expires it (use their built-in mechanism).

Include unit test for the login component (mocking Google response).