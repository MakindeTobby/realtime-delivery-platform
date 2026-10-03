# Password recovery

The API exposes:

- `POST /api/auth/forgot-password` with `{ "email": "..." }`. It returns the same message whether the account exists or not.
- `POST /api/auth/reset-password` with `{ "token": "...", "password": "..." }`. Passwords must be at least 8 characters. A reset token is valid for 30 minutes and can be used once.

The forgot-password endpoint sends a link through Resend. Configure `RESEND_API_KEY`, `EMAIL_FROM`, and `PASSWORD_RESET_URL`; the reset token is appended as the `token` query parameter to that URL. The URL should open a client page that submits the token and new password to the reset endpoint. Requests return `503` when the email provider configuration is absent; provider delivery errors are logged while the response remains generic.

Reset tokens are stored as SHA-256 hashes. A successful reset revokes all active sessions, requiring sign-in again on every device.

Apply `drizzle/20260929042000_password_resets/migration.sql` before deploying this API version. Forgot/reset endpoints have separate rate limits documented in `AUTH_RATE_LIMITS.md`.
