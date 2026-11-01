# Connecting the frontend to your Oracle PL/SQL backend

## Important architecture
Browser (HTML/CSS/JS) -> HTTPS REST API (ORDS) -> `BOOKSTORE_PKG` -> Oracle tables.

Do not put your FreeSQL schema password, database username, or SQL*Net connection string in JavaScript. Never connect the browser directly to the database.

## API base URL
After deploying ORDS and enabling a REST module, set in `api.js`:

```js
const API_BASE_URL = "https://YOUR_HOST/ords/YOUR_SCHEMA/bookstore";
```

The frontend adapter expects these JSON endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/books` | Return active books |
| POST | `/users` | Register a user |
| POST | `/auth/login` | Authenticate user |
| POST | `/orders` | Create order from cart items |
| GET | `/orders` | Return orders for authenticated user |
| DELETE | `/books/:book_id` | Admin soft-delete a book |
| POST | `/books` | Admin add a book |

## Suggested JSON response shapes

### GET /books
```json
[
  {"book_id":1,"title":"The Alchemist","author":"Paulo Coelho","category":"Fiction","price":299,"stock_qty":20}
]
```

### POST /users
Request:
```json
{"name":"Demo Reader","email":"reader@example.com","password":"temporary-demo-password"}
```
Return:
```json
{"user_id":12,"full_name":"Demo Reader","email":"reader@example.com"}
```

### POST /auth/login
Request:
```json
{"email":"reader@example.com","password":"temporary-demo-password"}
```
Return:
```json
{"user_id":12,"full_name":"Demo Reader","email":"reader@example.com","access_token":"..."}
```

### POST /orders
Request:
```json
{
  "user_id":12,
  "customer_name":"Demo Reader",
  "email":"reader@example.com",
  "address":"Delivery address",
  "total_amount":598,
  "items":[{"book_id":1,"quantity":2}]
}
```
Return:
```json
{"order_id":1001,"order_status":"PENDING","total_amount":598}
```

## Map API handlers to your existing package
- `GET /books`: query `BOOKS` where `is_active='Y'`.
- `POST /users`: call `BOOKSTORE_PKG.REGISTER_USER`.
- `POST /auth/login`: call `BOOKSTORE_PKG.LOGIN_USER`. For production, replace the sample password handling with secure salted password hashing and issue a short-lived session/token.
- `POST /orders`: validate the authenticated user on the server, call `ADD_TO_CART` for each submitted item, then call `CHECKOUT`; commit only after all steps succeed and roll back on error. Prefer a dedicated package procedure accepting the cart/order request to avoid trusting client-supplied `user_id` or `total_amount`.
- `DELETE /books/:id`: call `BOOKSTORE_PKG.REMOVE_BOOK`.
- `POST /books`: call `BOOKSTORE_PKG.ADD_BOOK`.

## Deployment limitation for this project
FreeSQL worksheet access and schema credentials do not automatically provide a public ORDS URL. You need an Oracle environment where ORDS is enabled and configured for your schema, or use Oracle APEX as the application layer. Ask your instructor which environment is available before trying to connect the frontend to FreeSQL.

## Current project mode
The supplied website defaults to local demo mode. The cart, sample account, orders, and inventory preview are stored in browser localStorage. This is intentional so you can demonstrate the GUI immediately while keeping the Oracle database separate until a REST layer is deployed.
