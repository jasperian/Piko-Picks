# Production Deployment

Use this checklist when moving the coffee shop discovery app from local development to a live launch.

## 1. Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Confirm the `shop-assets` storage bucket exists.
4. In Authentication settings, add the production callback URL:

   ```text
   https://your-domain.com/auth/callback
   ```

5. Copy the project URL, anon key, and service role key into your hosting environment variables.

## 2. Vercel

1. Import the repository into Vercel as a Next.js project.
2. Add the variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL, for example:

   ```text
   https://your-domain.com
   ```

4. Deploy.
5. Visit `/api/health` after deployment. It returns the configured and missing production variables.

## 3. Email

1. Verify a sending domain in Resend.
2. Set `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to a verified sender, for example:

   ```text
   Piko Picks <notifications@yourdomain.com>
   ```

## 4. Smoke Test

1. Register a shop.
2. Upload a cover image and gallery photos.
3. Add hours, menu items, and a promo.
4. Search for the shop publicly.
5. Post a review on the shop page.
6. Confirm the shop dashboard shows the review moderation tools.
7. Confirm `/api/health` is healthy before sharing the launch link.
