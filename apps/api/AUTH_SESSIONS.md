# Authentication session policy

- Access JWTs expire after 15 minutes.
- A sign-in creates a server-side session with a fixed 30-day expiry. Refreshing rotates the refresh JWT but does not extend that session's maximum lifetime; users sign in again after 30 days.
- The database stores only a SHA-256 hash of the current refresh JWT. Reusing a rotated refresh token revokes that session.
- Each protected API request checks that its session is active and loads the user's current role from the database. Logout revokes the session immediately, and role changes affect authorization on the next request.
- Account deletion cascades to its sessions. Any future password-change flow must call `AuthService.revokeAllSessionsForUser` so every device must sign in again.
- The mobile app keeps access and refresh JWTs in Expo SecureStore. It refreshes once on an expired access token, shares that refresh request across concurrent API calls, and replaces the stored refresh token after rotation.

Apply the `auth_sessions` schema migration before deploying the API version that reads the session table.
