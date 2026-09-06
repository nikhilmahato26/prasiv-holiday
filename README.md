# Prashiv Holiday — Travel Website + Admin Panel

Next.js 16 travel website with an admin panel for tour packages, destinations,
enquiries and site settings. Data lives in Postgres (Neon); images in Cloudinary;
OTP/enquiry mail over SMTP; rate-limit/session helpers on Upstash Redis.

## Routes
| URL | Description |
|-----|-------------|
| `/` | Customer homepage — hero slider, packages, destinations, enquiry forms |
| `/packages` | All packages |
| `/packages/[id]` | Package detail with day-wise itinerary |
| `/admin` | Admin login |
| `/admin/dashboard` | Packages, destinations, enquiries, settings |
| `/agency` | Partner-agency login |
| `/agency/dashboard` | Agency package submissions |

## Demo mode
With no `DATABASE_URL` set, the site runs entirely on the bundled seed data and
the admin panel opens with **demo / demo** at `/admin`. Every screen renders, but
the middleware refuses all non-GET API requests, so nothing can be saved,
uploaded or deleted — a banner on the login page and the dashboard says so.

The demo login is accepted *only* when `DATABASE_URL` is unset. Set it and
`/api/auth/login` goes back to checking the `users` table, the write block turns
off, and these credentials stop working. Always set `DATABASE_URL` and
`JWT_SECRET` for a real deployment.

## Setup
```bash
cp .env.example .env     # then fill in every value
npm install
node init.mjs            # create + seed tables
node scripts/seed-admin.mjs
npm run dev              # → http://localhost:3000
```

Admin accounts live in the `users` table — there are no hardcoded credentials.
`ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env` are consumed by the seed script.

## Scripts
All of these read `DATABASE_URL` from `.env` and are run with plain `node`.

| Script | What it does |
|--------|--------------|
| `init.mjs` | Creates and seeds every table. Run once on a fresh database. |
| `scripts/seed-admin.mjs` | Creates the admin user from `ADMIN_USERNAME` / `ADMIN_PASSWORD`. |
| `scripts/reseed-packages.mjs` | Wipes admin-owned packages and re-seeds from `lib/packages-data.js`. Agency submissions are kept. |
| `reset-db.mjs` | Drops and recreates the schema. Destructive. |
| `export_packages.mjs` | Dumps the packages table back out to `lib/packages-data.js`. |
| `export_destinations.mjs` | Same for `lib/destinations-data.js`. |
| `export_testimonials.mjs` | Same for `lib/testimonials-data.js`. |

The export scripts are the round trip for the seed data: edit in the admin panel,
export, commit, and the static demo mode picks up the new content.

## Environment
See `.env.example` for the full list: Neon `DATABASE_URL`, `JWT_SECRET`,
Upstash Redis, SMTP (`SMTP_HOST`/`PORT`/`USER`/`PASS`/`SECURE`, `ENQUIRY_EMAIL`),
Cloudinary, and `NEXT_PUBLIC_SITE_URL` for links inside emails.

## Catalogue
Packages carry a `region` of `domestic` or `international`, and the packages
section switches between the two before showing destination tabs. Destinations
carry the same field, so picking one in the admin form sets the package's region
for you. Seed catalogue: 36 domestic packages across 12 states, 25 international
across Thailand, Dubai, Bali, Singapore and Vietnam (5 each).

Packages saved before the split have no `region` and are treated as domestic.

## Branding
- **Logo:** `public/logo.png` (also copied to `app/icon.png` and `app/apple-icon.png` for the favicon)
- **Contact number:** currently hardcoded to `7796950505` (`+91 77969 50505`). It is
  also seeded into the `settings` table (`phone`, `whatsapp`), so it can be changed
  from **Admin → Settings** without a redeploy. Fallback defaults live in
  `hooks/useSettings.js` and `lib/db.js`.
- **Email / social links:** blank by default — set them in Admin → Settings.

## Colour theme (from the logo)
| Role | Hex |
|------|-----|
| Navy (primary) | `#16294D` |
| Navy dark (hover) | `#0E1B33` |
| Navy light (gradients) | `#2F5490` |
| Navy tint (surfaces) | `#EEF2F8` |
| Gold (accent) | `#C9A227` |
| Gold dark (text on white) | `#8A6E1C` |
| Gold tint | `#FBF6E7` |

Tokens are defined in the `@theme` block of `app/globals.css` (Tailwind v4) and
mirrored in `tailwind.config.js` for editor tooling.

## Deploy
Push to a Git host, import into Vercel, add the same environment variables, deploy.
