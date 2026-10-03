# Authentication rate limits

The API uses Postgres-backed fixed-window counters, shared across API instances:

- Login: 20 attempts per client IP and 10 attempts per normalized email in 15 minutes.
- Registration: 5 attempts per client IP in 1 hour.
- Forgot password: 10 requests per client IP and 3 per normalized email in 1 hour.
- Reset password: 10 requests per client IP in 1 hour.
- Rejected requests receive HTTP 429 and a `Retry-After` header. The response is the same for all identities, so it does not reveal whether an email has an account.

All limits/windows can be overridden with the corresponding `AUTH_LOGIN_*`, `AUTH_REGISTER_*`, `AUTH_FORGOT_PASSWORD_*`, and `AUTH_RESET_PASSWORD_*` settings. Each value must be a positive integer.

When running behind a trusted ingress, set `TRUST_PROXY_HOPS` to the exact number of trusted proxy hops so Express can derive the client IP. It defaults to `0`; only enable proxy trust when the API cannot be reached directly around that ingress. Rate-limit keys are SHA-256 hashed before storage, and expired buckets are periodically deleted.

Apply the `auth_rate_limits` schema migration before deploying the API version that enables these guards.
