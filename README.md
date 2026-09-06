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

## Environment
See `.env.example` for the full list: Neon `DATABASE_URL`, `JWT_SECRET`,
Upstash Redis, SMTP (`SMTP_HOST`/`PORT`/`USER`/`PASS`/`SECURE`, `ENQUIRY_EMAIL`),
Cloudinary, and `NEXT_PUBLIC_SITE_URL` for links inside emails.

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
