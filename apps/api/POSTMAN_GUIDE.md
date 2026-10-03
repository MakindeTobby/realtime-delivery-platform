# Food Delivery API — Postman guide

This guide describes the API currently implemented in this repository. The Postman collection source is the synced folder `postman/Food Delivery API/`; the local environment is `postman/Food Delivery — Local.environment.yaml`.

## Set up

1. Open the synced **Food Delivery API** collection and import/select the **Food Delivery — Local** environment.
2. Select **Food Delivery — Local** and set `baseUrl` to the API origin plus prefix, for example `http://localhost:3000/api`. For a phone or emulator, use an origin reachable from that device instead of `localhost`.
3. Register a customer with **Auth → Register customer**, or sign in with **Auth → Login**. The collection saves `accessToken` and `refreshToken` from the response. The access token is sent as `Authorization: Bearer {{accessToken}}` for requests that need it.
4. Owner and driver endpoints require separately provisioned accounts. Public registration always creates a `CUSTOMER`; role assignment/onboarding is not exposed by the API. Log in with an owner or driver account; the Postman login script saves the role-specific token for the matching requests.

Access tokens last 15 minutes. Use **Auth → Refresh session** to rotate the refresh token; the collection updates both tokens. A session has a fixed 30-day maximum lifetime. **Auth → Logout** revokes the refresh-token session.

## Routes

All HTTP paths below are relative to `{{baseUrl}}` (`/api`). JSON requests should use `Content-Type: application/json`.

### Auth

| Method and path | Access | Request body / behavior |
|---|---|---|
| `POST /auth/register` | Public, rate limited | `{ "firstName": "Ada", "lastName": "Lovelace", "email": "ada@example.com", "password": "password123" }`. Always creates a customer and returns `user`, `accessToken`, `refreshToken`, and `accessTokenExpiresIn`. |
| `POST /auth/login` | Public, rate limited | `{ "email": "ada@example.com", "password": "password123" }`. Returns the same session shape. Invalid email/password both return `401 Invalid Credentials`. |
| `POST /auth/refresh` | Refresh token in body | `{ "refreshToken": "{{refreshToken}}" }`. Rotates both tokens. Reuse of an old refresh token revokes the session. |
| `POST /auth/logout` | Refresh token in body | `{ "refreshToken": "{{refreshToken}}" }`. Revokes that session. |
| `POST /auth/forgot-password` | Public, rate limited | `{ "email": "ada@example.com" }`. Generic response whether the email exists; requires Resend settings on the API. |
| `POST /auth/reset-password` | Public, rate limited | `{ "token": "<token from email>", "password": "newpassword123" }`. Token expires after 30 minutes and can be used once; success revokes all sessions. |
| `GET /auth/me` | Bearer access token | Returns the current account without its password. |

### Restaurants

| Method and path | Access | Request body / query |
|---|---|---|
| `POST /restaurants` | Restaurant owner | `{ "name": "Pasta House", "description": "Fresh pasta", "address": "12 Main St", "cuisineType": "Italian", "imageUrl": "https://..." }`. One restaurant per owner. |
| `GET /restaurants/mine` | Restaurant owner | Returns the owner’s restaurant, or `null` if none exists. |
| `GET /restaurants?search=pasta` | **Currently requires bearer token** | Searches open restaurants by name or cuisine. The controller has a class-level JWT guard, even though this listing looks intended for customer browsing. |
| `GET /restaurants/params?search=pasta&cuisineType=Italian&isOpen=true&page=1&limit=20` | **Currently requires bearer token** | Paginated listing; response is `{ data, meta }`. `limit` is 1–50. |
| `GET /restaurants/:id` | **Currently requires bearer token** | Returns one restaurant. |
| `PATCH /restaurants/:id` | Restaurant owner who owns the restaurant | Send any supported fields, e.g. `{ "isOpen": true }`. |

### Menu

| Method and path | Access | Request body / query |
|---|---|---|
| `POST /menu/categories` | Restaurant owner | `{ "name": "Pasta" }`. Category is created for the signed-in owner’s restaurant. |
| `GET /menu/categories/:restaurantId` | Public | Returns categories for a restaurant. |
| `PATCH /menu/categories/:id` | Restaurant owner who owns the category | `{ "name": "Pasta & Noodles" }`. |
| `DELETE /menu/categories/:id` | Restaurant owner who owns the category | Deletes the category; related menu items cascade-delete. |
| `POST /menu/items` | Restaurant owner | `{ "categoryId": "<uuid>", "name": "Spaghetti", "description": "...", "price": "12.50", "imageUrl": "https://..." }`. Price is a decimal string. |
| `GET /menu/items/:restaurantId` | Public | Returns menu items for a restaurant. |
| `PATCH /menu/items/:id` | Restaurant owner who owns the item | Partial item fields, including `isAvailable`. |
| `DELETE /menu/items/:id` | Restaurant owner who owns the item | Deletes the item. |

### Orders and payments

| Method and path | Access | Request body / behavior |
|---|---|---|
| `POST /orders` | Customer | `{ "restaurantId": "<uuid>", "deliveryAddress": "12 Main St", "items": [{ "menuItemId": "<uuid>", "quantity": 2 }] }`. Server calculates the item total and snapshots prices. |
| `GET /orders/mine` | Customer or driver | Returns that user’s orders, including restaurant and item details. |
| `GET /orders/restaurant` | Restaurant owner | Returns orders for the owner’s restaurant. |
| `GET /orders/:id` | Authenticated customer, owner, or assigned driver | Returns an order and its items if the caller is authorized for that order. |
| `PATCH /orders/:id/status` | Restaurant owner or assigned driver | `{ "status": "PREPARING" }`. Owner transitions: `CONFIRMED → PREPARING → READY` (also cancellation from confirmed/preparing). Driver transitions: `READY → PICKED_UP → DELIVERED`. |
| `POST /payments/intent` | Customer who owns the order | `{ "orderId": "<uuid>" }`. Returns `{ "clientSecret": "..." }` for Stripe client confirmation. |
| `POST /payments/webhook` | Stripe server only | Requires Stripe’s `stripe-signature` and the original raw request body. Frontends must not call this endpoint. |

### Driver

| Method and path | Access | Behavior |
|---|---|---|
| `PATCH /driver/online` | Driver | Toggles the authenticated driver’s `isOnline` value; no request body. This is a toggle, so do not automatically retry it. |
| `GET /driver/status` | Driver | Returns `{ "isOnline": true }` or `{ "isOnline": false }`. |
| `POST /driver/orders/:id/decline` | Driver assigned to the order | Clears the assignment and invokes automatic assignment again. A driver who does not own the assignment gets `404`. |

When a restaurant owner changes an order to `READY`, the API assigns the first online driver returned by the database query and emits `driver:assigned`. Assignment currently does not use location or proximity. If there are no online drivers, the order remains `READY` without an assigned driver. There is no separate accept-order endpoint; drivers can decline an assignment or update an assigned order’s status. The decline flow does not exclude the declining driver from the next assignment query, so it can select that driver again; this needs a backend fix before relying on reassignment.

### Health and uploads

- `GET /health` returns `{ "status": "ok", "timestamp": "..." }`.
- Uploads use the UploadThing Expo client pointed at `{{serverOrigin}}/api/uploadthing`. The `restaurantImage` and `menuItemImage` file routes require a valid restaurant-owner access token. Use the Expo UploadThing helper rather than constructing the UploadThing protocol requests manually. `UPLOADTHING_TOKEN` must be configured on the API.
- `GET /db-test` is a development diagnostic and returns a sample user row. Do not expose or use it from the frontend.

## Socket.IO order updates

The gateway uses Socket.IO namespace `{{serverOrigin}}/orders` (Socket.IO protocol, websocket transport). Client events are `join:order` with an order ID, `join:restaurant` with a restaurant ID, and `join:driver` with a driver ID. Server events are `order:updated` with the updated order row and `driver:assigned` with the newly assigned order. The driver assignment event is triggered when an owner marks an order `READY`.

**Realtime is currently for integration development only.** The gateway does not authenticate sockets or authorize room membership, so a client can request another user’s room. Do not use it with real customer/order data or publish it as a supported production integration until socket authorization is added. The customer mobile hook also currently does not return its order update state.

## Known API behavior to account for

- Restaurant list/detail routes currently require a bearer token due to the controller-level guard; confirm whether they should be public before building signed-out browsing.
- `isOpen=false` in the paginated restaurant query may be parsed incorrectly by the current DTO transform. The collection demonstrates `isOpen=true`; the false-filter behavior needs a code fix and verification.
- Order creation currently does not enforce restaurant-open or menu-item-available state.
- Payment intents currently use USD. Confirm currency before a production frontend integrates checkout.
- Owner and driver accounts must be provisioned outside the API. Driver availability and decline endpoints exist, but there is no onboarding or explicit accept-order endpoint.

## Error handling

Common responses include `400` for invalid input or invalid order-state transitions, `401` for missing/expired authentication, `403` for role/ownership violations, `404` for inaccessible or missing resources, `409` for duplicate registration, `429` for auth rate limits, and `503` when password recovery email is not configured. Rate-limited responses include `Retry-After`.

## Publish as public Postman documentation

Open the synced **Food Delivery API** collection in Postman, choose **View documentation**, then use Postman’s **Publish** action and share the resulting documentation URL with the frontend team. Keep real credentials and tokens in the local/private environment; do not include them in the published collection.
