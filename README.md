# Maison Assemblé

A responsive editorial fashion landing page with an interactive look builder, collection filters, material stories, micro-interactions and a demonstration shopping request flow.

## Run locally

The project is static and has no build step:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Structure

- `index.html` — semantic page structure
- `styles.css` — responsive art direction, transitions and reduced-motion support
- `app.js` — look builder, collection, cart, menu and interaction logic
- `assets/` — optimized editorial imagery and product atlas

The request/checkout view is intentionally a front-end demonstration and does not send form data or collect payment.
