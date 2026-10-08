# Swiftbite

**A full-stack food delivery platform built to explore the systems behind the meal.**

Swiftbite connects customers, restaurants, and delivery partners through an Expo mobile app, a restaurant web workspace, and a NestJS API. The project is being developed as a hands-on study of backend design: identity and partner onboarding, authorization, order and payment lifecycles, concurrent driver assignment, and real-time updates.

> **Portfolio note:** Swiftbite is an active learning and showcase project, not a production food-delivery service. The API has working domain flows, while much of the mobile experience still uses mock data. This README separates implemented behavior from the work still needed to make the platform production-ready.

## Product surfaces

| Surface | What it does today |
| --- | --- |
| **Expo mobile app** (`apps/mobile`) | Customer, restaurant-owner, and driver screen flows. Login and API health-check integration are present; many discovery, menu, cart, order, and role-dashboard screens still use mock data. |
| **Restaurant web app** (`apps/web`) | Swiftbite landing page, login, restaurant application and email-verification flow, and a protected restaurant workspace for approved owners to manage profile, menu, and orders. |
| **API** (`apps/api`) | NestJS REST API, Swagger documentation, PostgreSQL persistence, authentication, restaurant/menu/order operations, Stripe payment intents and webhooks, driver assignment, and an authenticated Socket.IO gateway. |

## Architecture

```mermaid
flowchart LR
  Customer[Customer / Expo app]
  Driver[Driver / Expo app]
  OwnerApp[Restaurant owner / Expo app]
  OwnerWeb[Restaurant owner / React web]
  API[NestJS API<br/>REST + Socket.IO]
  DB[(PostgreSQL<br/>Drizzle ORM)]
  Stripe[Stripe<br/>Payment intents + webhook]
  Resend[Resend<br/>Verification + recovery email]
  UploadThing[UploadThing<br/>Restaurant and menu images]

  Customer -->|HTTP /api| API
  Driver -->|HTTP /api| API
  OwnerApp -->|HTTP /api| API
  OwnerWeb -->|HTTP /api| API
  Customer <-->|Socket.IO /orders| API
  Driver <-->|Socket.IO /orders| API
  OwnerApp <-->|Socket.IO /orders| API
  OwnerWeb <-->|HTTP /api| API
  API <--> DB
  API -->|Create intent| Stripe
  Stripe -->|Signed webhook| API
  API --> Resend
  OwnerWeb -->|Authenticated upload| UploadThing
  OwnerApp -->|Authenticated upload| UploadThing
```

### Repository map

```text
apps/
  api/       NestJS modules, Drizzle schema and migrations, Swagger, Postman docs
  mobile/    Expo Router application for customer, restaurant-owner, and driver flows
  web/       React + Vite landing page, restaurant onboarding, and owner workspace
packages/
  types/     Shared TypeScript types and enums
```

The API is organized around domain modules: `auth`, `restaurants`, `menu`, `order`, `payments`, `driver`, `admin`, and `gateway`. The web app keeps transport code in `src/api`, React Query behavior in `src/hooks`, onboarding state in Zustand, and route-level UI in `src/pages`.

## Engineering decisions

These decisions show the reasoning behind the current shape of the system, including the trade-offs that remain.

### 1. An account is separate from a partner application

Public registration creates a customer account. Restaurant-owner and driver roles are added when a verified account applies for that capability; the application itself has a separate verification status. This avoids trusting a role selected by the client and lets one person hold more than one role. It also lets the product authenticate a prospective partner before collecting business or driver details.

Restaurant and driver approval is a separate gate from email verification. Restaurant discovery and order creation require an approved, open restaurant. Drivers cannot go online until approved. Administrative review endpoints update application status.

### 2. Sessions are revocable server-side

Access JWTs last 15 minutes. A login creates a database-backed session with a fixed 30-day lifetime. The API stores a hash of the current refresh token, rotates refresh tokens, detects reuse of an old token, and revokes sessions on logout or password reset. The mobile client stores tokens in Expo SecureStore and coordinates concurrent refresh attempts.

This makes logout, role changes, and credential recovery enforceable across devices. The trade-off is a database lookup on protected requests; a future scale pass should measure that cost before changing the session model.

### 3. Order state and payment confirmation have explicit owners

Creating an order does not mean it is paid. The payment provider's signed webhook moves a successful payment to `PAID` and the order to `CONFIRMED`. Restaurant owners and drivers have different allowed status transitions, and changes are recorded in `order_status_history`. Order-item rows preserve the item name and unit price captured when the order was created, even if a menu item later changes.

The current payment integration uses USD. Currency, settlement, delivery fees, and payouts must be designed for the target market before treating payments as launch-ready.

### 4. Driver assignment protects a shared resource

When a restaurant marks an order ready, the API looks for an approved, online driver who is not already handling an active delivery and has not declined the order. A PostgreSQL transaction, per-driver advisory transaction lock, and conditional `driver_id IS NULL` update protect assignment from concurrent dispatch attempts.

This is a deliberate first dispatch strategy. It does not yet rank drivers by distance, use PostGIS, or dispatch through a durable queue. The driver-location table stores coordinates, but there is no location-ingestion API or radius-search implementation yet.

### 5. WebSockets carry updates; REST remains the recovery path

The `/orders` Socket.IO namespace authenticates the JWT during connection and authorizes subscriptions to order, restaurant, and driver rooms. It emits `order:updated` and `driver:assigned` events. REST endpoints remain the source for reading current order state.

Socket.IO reconnects are not yet paired with event replay or a cursor-based recovery protocol. Clients should refetch current order state after reconnect. The mobile socket hook is still prototype-level and does not currently attach the handshake token, so the authenticated gateway and mobile realtime flow are not yet end-to-end connected.

### 6. Security checks live at more than one layer

- DTO validation runs through a global Nest `ValidationPipe` with transformation, whitelisting, and rejection of unknown fields.
- JWT and role guards protect API capabilities; services also check ownership of restaurants and orders.
- Email verification and partner approval gate sensitive lifecycle actions.
- UploadThing middleware validates the JWT and restaurant-owner role before accepting restaurant or menu images.
- Authentication rate limits use PostgreSQL-backed fixed-window counters, so limits are shared across API instances. This keeps the first deployment simple, though a high-volume deployment may move hot counters to Redis.

## Implemented API capabilities

The API uses the `/api` prefix. Start the API and open **[Swagger UI](http://localhost:3000/api/docs)** for the live contract. A Postman collection and setup guide are in [`apps/api/postman`](apps/api/postman) and [`apps/api/POSTMAN_GUIDE.md`](apps/api/POSTMAN_GUIDE.md).

| Area | Routes / behavior |
| --- | --- |
| Authentication | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password`; `GET /auth/me`; partner existence check at `POST /auth/partner/check-existence` |
| Restaurants | Public listing/search; `POST /restaurants/onboarding`; owner `GET /restaurants/mine` and `PATCH /restaurants/:id`; admin review at `/admin/restaurants/pending` and `/admin/restaurants/:id/verification` |
| Menus | Public category/item reads; restaurant-owner category and item create, update, and delete operations |
| Orders | Customer order creation and history; owner restaurant-order list; order detail; role-checked status transitions |
| Payments | Customer payment-intent creation and signed Stripe webhook handling |
| Drivers | Apply, status, online availability, order decline; admin review; automatic assignment when an order is ready |
| Realtime | Authenticated Socket.IO namespace `/orders`; room subscriptions and order/assignment events |
| Uploads | UploadThing router at `/api/uploadthing` with authenticated restaurant-owner middleware |

Authentication behavior is documented in [`AUTH_SESSIONS.md`](apps/api/AUTH_SESSIONS.md), [`AUTH_RATE_LIMITS.md`](apps/api/AUTH_RATE_LIMITS.md), and [`AUTH_PASSWORD_RESET.md`](apps/api/AUTH_PASSWORD_RESET.md).

### Order lifecycle

```text
PENDING --successful Stripe webhook--> CONFIRMED
CONFIRMED --restaurant accepts--> PREPARING
PREPARING --restaurant finishes--> READY --driver pickup--> PICKED_UP --> DELIVERED
```

Driver assignment happens while an order is `READY`; assignment itself does not advance the order status. The restaurant can cancel from `CONFIRMED` or `PREPARING`. Drivers can decline an assigned `READY` order; the API records the decline and attempts another assignment.

## Data model

The PostgreSQL schema is defined in `apps/api/src/db/schema` with Drizzle ORM. Main entities include:

- **Identity and access:** `users`, `user_roles`, `auth_sessions`, `email_verifications`, `password_resets`, `auth_rate_limits`
- **Partner profiles:** `restaurants`, `driver_profiles`, `driver_locations`, `driver_order_declines`
- **Commerce:** `menu_categories`, `menu_items`, `orders`, `order_items`, `order_status_history`
- **Customer and trust:** `user_addresses`, `reviews`

Roles are a many-to-many relation rather than a single column on `users`. Partner verification status is stored on each partner profile, so account access and business approval remain distinct concepts.

## Run locally

### Prerequisites

- Node.js version supported by the installed Expo/NestJS toolchains
- pnpm `10.30.3` (the repository's `packageManager` version)
- PostgreSQL database, local or hosted
- Stripe test keys for payment-intent operations
- Resend credentials for actual email delivery
- UploadThing token for image uploads

Install workspace dependencies from the repository root:

```bash
pnpm install
```

Create `apps/api/.env` with the required values:

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-random-secret-at-least-32-bytes-long

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_TOKEN=...

# Email verification and password reset
RESEND_API_KEY=re_...
EMAIL_FROM=Swiftbite <no-reply@your-verified-domain.example>
PASSWORD_RESET_URL=http://localhost:5173/reset-password

# Optional when deployed behind a known proxy
TRUST_PROXY_HOPS=0
```

`JWT_SECRET` is validated at startup and must contain at least 32 bytes. Resend is required for production email delivery. Without it, non-production verification codes are logged by the API; production does not expose a code when delivery is unavailable. Password recovery requires all three email/reset variables. Use Stripe test credentials during development and configure the Stripe webhook to reach `/api/payments/webhook`.

The web app uses the Vite proxy from port `5173` to `localhost:3000`, so its default API base `/api` works in local development. Override it with `VITE_API_URL` if your API is hosted elsewhere. For a physical Expo device, set `EXPO_PUBLIC_API_URL` to a reachable host such as `http://192.168.x.x:3000/api` and `EXPO_PUBLIC_SERVER_URL` to the API origin without `/api` (for example `http://192.168.x.x:3000`). `localhost` on a phone refers to the phone itself.

Apply the database schema. For a disposable development database, the direct schema push is convenient:

```bash
pnpm --filter api db:push
```

For migration-based changes, generate and apply migrations:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

Run each surface in its own terminal:

```bash
# API: http://localhost:3000/api/health, Swagger at /api/docs
pnpm --filter api start:dev

# Web: http://localhost:5173
pnpm --filter web dev

# Expo development server
pnpm --filter mobile start
```

The repository includes a development seed script:

```bash
pnpm --filter api db:seed
```

It creates demo users, approved restaurants, drivers, and menus. The seed is not idempotent and uses the same development password (`Password123!`) for its sample accounts. Run it only against a disposable local database; never use those credentials or seed data in a shared or production environment. The current seed does not create active orders.

## Build and quality checks

```bash
pnpm --filter api build
pnpm --filter web build
pnpm --filter api test
```

API tests use Jest; the web build runs TypeScript project checks before Vite. Mobile screens and backend flows are not yet covered by a comprehensive integration or end-to-end test suite.

## Current gaps and next engineering steps

The next steps are intentionally prioritized by product risk and system impact:

1. **Complete the transactional customer journey.** Connect mobile restaurant discovery, menus, cart, order creation, Stripe payment confirmation, and order history to the API. Add integration tests around payment and order-state boundaries.
2. **Finish driver operations.** Build the driver application UI, document/profile collection, location ingestion, active delivery flow, and verified realtime connection.
3. **Make realtime recoverable.** Attach the JWT in the mobile Socket.IO handshake, reconnect and rejoin rooms, then refetch authoritative REST state. Add event replay only if product requirements need missed-event history.
4. **Make delivery dispatch location-aware.** Add PostGIS or an equivalent indexed proximity strategy, distance-based candidate ranking, and concurrency/load tests before increasing dispatch volume.
5. **Harden payment operations for the target market.** Confirm currency, fees, refunds, failed-payment handling, webhook event idempotency, and settlement/payout behavior. Current payment code is not a complete marketplace money flow.
6. **Improve operations and observability.** Add structured request logs, metrics, error monitoring, health/readiness checks, and deployment guidance. Expand automated authorization, concurrency, and end-to-end coverage.

## What this project demonstrates

- Full-stack work across Expo, React, NestJS, PostgreSQL, and external service integrations.
- Modeling identity, roles, partner applications, verification, sessions, and revocation as distinct concerns.
- Turning order behavior into explicit state transitions and audit history.
- Thinking about concurrent assignment and shared database state before scaling dispatch.
- Separating durable HTTP state from transient realtime notifications.
- Calling out where a prototype stops, which trade-offs are deliberate, and what evidence is needed before production claims.

The goal is not to present a tutorial-sized feature list as production infrastructure. It is to make the system decisions visible, explain their constraints, and keep improving the implementation against those constraints.
