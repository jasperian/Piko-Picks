# Local App With Supabase

Use this when you want to run the app on `localhost:3000` but store real data in Supabase.

## 1. Create A Supabase Project

1. Go to the Supabase dashboard.
2. Create a new project.
3. Open **Project Settings > API**.
4. Copy:
   - Project URL
   - anon public key
   - service_role secret key

Keep the `service_role` key private. It belongs only in `.env.local` or production server environment variables.

## 2. Run The Database Schema

1. In Supabase, open **SQL Editor**.
2. Paste the full contents of `supabase/schema.sql`.
3. Run it once.
4. Confirm the `shop-assets` bucket exists in **Storage**.

The schema creates the app tables, row level security policies, enums, indexes, and storage policies.

## 3. Create `.env.local`

In the project root, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional until you test paid plans.

# Optional until you test email notifications.
RESEND_API_KEY=
EMAIL_FROM=

# Optional until address geocoding is added.
MAPBOX_PUBLIC_TOKEN=
```

Restart the dev server after changing `.env.local`.

## 4. Configure Auth Redirects

In Supabase, open **Authentication > URL Configuration**.

Set the site URL:

```text
http://localhost:3000
```

Add this redirect URL:

```text
http://localhost:3000/auth/callback
```

## 5. Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Check the environment wiring:

```text
http://localhost:3000/api/health
```

If Supabase variables are configured, the Supabase checks should show `"configured": true`.

## 6. First Manual Test

1. Visit `/auth` and create a shop owner account.
2. Visit `/register-shop` and create a coffee shop.
3. Upload a cover image and optional gallery photos.
4. Visit `/dashboard` and add menu items.
5. Visit `/` and search for the shop.
6. Open the shop page and post a review.
7. Return to `/dashboard` and moderate the review.
