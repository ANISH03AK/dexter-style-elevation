# Vercel Deployment Guide

## 1. Import the repository

Vercel → **Add New → Project** → import this repo. It auto-detects Vite:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

`vercel.json` already pins these plus SPA rewrites and long-term asset caching.

## 2. Environment variables

Add exactly two variables (Production, Preview and Development):

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your anon public key |

Nothing else is required. Vite inlines these at build time, so **redeploy after
changing them**.

## 3. Deploy

Push to the default branch, or click **Deploy**. Verify locally first:

```bash
npm install
npm run build
npm run preview
```

## 4. Post-deploy checklist

- Add your Vercel domain to the backend auth **Site URL / redirect URLs** so
  email confirmations, password resets and Google login return to your app.
- SPA deep links (`/shop`, `/product/:id`) work via the rewrite in `vercel.json`.
- Storage images are served from the public `product-images` bucket.

## 5. Performance notes

- Routes are lazy-loaded with `React.lazy` + `Suspense` (code splitting).
- Vendor chunks (`react`, `framer-motion`, `supabase`) are split manually.
- Static assets under `/assets` are cached immutably for one year.
- Images use `loading="lazy"` / `decoding="async"`.
