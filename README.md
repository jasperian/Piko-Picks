# Coffee Shop Discovery MVP

A Next.js + Supabase MVP for coffee shop discovery, shop-owned menu management, direct shop registration, and customer reviews.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   MAPBOX_PUBLIC_TOKEN=optional-mapbox-token
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=re_...
   EMAIL_FROM="Piko Picks <notifications@yourdomain.com>"
   ```

   You can also copy `.env.example` and fill in the values.

3. Run the Supabase SQL in `supabase/schema.sql`.

4. Start the app:

   ```bash
   npm run dev
   ```

The app includes demo data fallbacks so the public discovery screen can be viewed before Supabase is configured.

The SQL creates a public Supabase Storage bucket named `shop-assets` for shop, menu, gallery, and review images.

For a step-by-step local setup against a hosted Supabase project, see `LOCAL_SUPABASE.md`.

## Auth

Supabase email/password auth is wired through `/auth`. For email confirmation links, set `NEXT_PUBLIC_SITE_URL` to the deployed app URL and add `/auth/callback` to the Supabase Auth redirect allow list.

### Demo accounts

Create or refresh the development-only demo accounts with:

```bash
npm run seed:demo-accounts
```

All three use the password `PikoDemo123!`:

- Admin: `admin@pikopicks.test`
- Customer: `customer@pikopicks.test`
- Shop owner: `owner@pikopicks.test`

Change or remove these credentials before a public production launch.

## Email Notifications

Resend environment variables are reserved for future notification features. The current visible MVP focuses on shop registration, menus, discovery, and reviews.

## Deployment

See `DEPLOYMENT.md` for the production launch checklist. After deployment, visit `/api/health` to confirm required production environment variables are configured.
