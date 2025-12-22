# GameForest — SteamDB-style catalog & marketplace

Dark-mode static build that runs on GitHub Pages and mimics an investor-friendly MVP:
- Catalog with filters, sorting, pagination, compare modal.
- UA/EN live switcher with LocalStorage persistence.
- Local session auth (LocalStorage), pitch/investor modal, sticky topbar.
- Marketplace / Top-up page with Stripe Test stubs and curated listings.
- Success / cancel landing pages for Stripe Checkout redirect.

## Structure
- `index.html` – catalog page.
- `market.html` – marketplace / top-up.
- `game.html` – сторінка детальної інформації про гру з графіком ціни.
- `about.html` – project story and roadmap.
- `styles.css` – shared styles (dark SteamDB-ish minimalism).
- `i18n.js` – translations + language persistence.
- `shell.js` – shared nav/auth/pitch logic.
- `data.js` – catalog dataset (SteamStatic covers to avoid broken images).
- `market-data.js` – top-up products + curated listings (skins/accounts/cases).
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
- **Firebase / Supabase**: host static files; implement equivalent edge function for Stripe session creation. Use Supabase/Firebase Auth for real accounts (local auth stores passwords in the browser; do not use in production).

## Supabase auth & profile storage
The UI is wired to Supabase Auth. The repo already ships with the GameForest demo project config (see `supabase-config.js`):

```js
window.GF_SUPABASE_CONFIG = {
  url: "https://kzwotblfcbectvcwinxr.supabase.co",
  anonKey: "sb_publishable_u3GeBpf_LSAQ_kbYlls6QQ_a1bBQHns"
};
```

- Users: Supabase dashboard → **Authentication → Users**.
- Profile data: table **profiles** (columns `id` (uuid, PK, references auth.users), `email`, `username`, `avatar_url`, `bio`, `created_at`/`updated_at`).
- Avatars: storage bucket **avatars** (public policy recommended for this demo). File names are `{userId}/{timestamp}.ext`.

Sessions persist via Supabase client auto-refresh; Google OAuth is enabled via the `Sign in with Google` button in the auth modal.

## Notes
- Covers use `steamstatic` links to avoid broken assets.
- Images are `loading="lazy"` for performance; table scrolls horizontally on mobile.
- Marketplace listings are mock items only; no account transfer or ToS violations.
- For production auth, store tokens only (not passwords) and move credential handling off the client.
