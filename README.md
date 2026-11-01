# ChapterOne — Online Bookstore Frontend

A responsive, professional bookstore UI built with HTML, CSS and vanilla JavaScript.

## Files
- `index.html` — page structure, navigation, catalogue, cart, login/register, orders and admin preview
- `style.css` — responsive styling
- `api.js` — API adapter with local demo mode and a live REST API configuration point
- `app.js` — frontend interactions
- `API_INTEGRATION_GUIDE.md` — how to connect the existing Oracle PL/SQL package

## Run the frontend now
1. Extract this ZIP.
2. Open the folder in VS Code.
3. Open `index.html` in a browser (or use VS Code Live Server).
4. The site starts in **DEMO PREVIEW** mode. It uses browser localStorage, so it does not modify your Oracle database.
5. Try search, category filter, add-to-cart, registration, checkout, orders and admin inventory.

Use a demo-only password. Demo data stays in your browser.

## Important about Oracle FreeSQL
Oracle FreeSQL is a browser-based SQL worksheet. It lets you run SQL/PLSQL, but it is not by itself a public REST API endpoint for a separate HTML website. A browser must never connect directly to an Oracle database using database credentials.

To make this website use your actual PL/SQL backend, deploy the schema/package on an Oracle database with a secure REST layer such as Oracle REST Data Services (ORDS), or build an Oracle APEX application. Then set `API_BASE_URL` in `api.js` to your ORDS endpoint and implement the endpoint contract in `API_INTEGRATION_GUIDE.md`.

The current frontend's Admin screen is a demonstration UI. In a real deployment, protect admin actions with server-side authorization; hiding a button is not security.
