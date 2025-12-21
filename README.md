# GameForest Demo (SteamDB-ish)

Dark-mode static demo that runs on GitHub Pages and mimics an investor-friendly MVP:
- Catalog with filters, sorting, pagination, compare modal.
- UA/EN live switcher with LocalStorage persistence.
- Demo auth (LocalStorage), pitch/investor modal, sticky topbar.
- Marketplace / Top-up page with Stripe Test demo flow and demo listings.
- Success / cancel landing pages for Stripe Checkout redirect.

## Structure
- `index.html` – catalog page.
- `market.html` – marketplace / top-up demo.
- `game.html` – сторінка детальної інформації про гру з графіком ціни.
- `about.html` – project story and roadmap.
- `styles.css` – shared styles (dark SteamDB-ish minimalism).
- `i18n.js` – translations + language persistence.
- `shell.js` – shared nav/auth/pitch logic.
- `data.js` – catalog dataset (SteamStatic covers to avoid broken images).
- `market-data.js` – top-up products + demo listings (skins/accounts demo only).
- `app.js` – catalog interactions.
- `market.js` – marketplace / top-up interactions.
- `success.html`, `cancel.html` – redirect targets for Stripe Checkout.

## Running locally
Open `index.html` (or other pages) directly in the browser or via a simple static server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deployment
- **GitHub Pages**: push to `main` and enable Pages (static, works without backend).
- **Vercel / Netlify**: deploy static folder. Add serverless function `POST /api/create-checkout-session` that calls `stripe.checkout.sessions.create` (Test Mode) and returns `session.url`. Point success/cancel URLs to `success.html` and `cancel.html`.
- **Firebase / Supabase**: host static files; implement equivalent edge function for Stripe session creation. Use Supabase/Firebase Auth for real accounts (demo auth stores passwords locally; do not use in production).

## Notes
- Covers use `steamstatic` links to avoid broken assets.
- Images are `loading="lazy"` for performance; table scrolls horizontally on mobile.
- Marketplace demo listings are mock items only; no account transfer or ToS violations.
- For production auth, store tokens only (not passwords) and move credential handling off the client.
