# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**No Time To Waste** (`notimetowaste.lat`) — an e-commerce storefront + admin panel for a watch brand, built on GCP. Started in June 2026 as a generic Shopify product feed / CRUD system for "Reech Tools"; it was rebranded in stages (futuristic → luxury warm-dark → current warm-monochrome editorial) into a standalone watch-retail product with its own BigQuery-native catalog (no Shopify dependency at all anymore).

## Commands

### Frontend (shopify-crud)
```bash
# Dev server (from root)
./iniciar.sh
# or
cd shopify-crud && pnpm run dev

# Build
cd shopify-crud && pnpm run build

# Lint
cd shopify-crud && pnpm run lint
```

### Cloud Functions
Each function in `cloud-functions/` is a standalone Node.js package. There is no shared deploy script — functions are deployed individually via the GCP console or `gcloud`.

## Architecture

Two layers: a Next.js frontend and a set of GCP Cloud Functions backing a BigQuery watch catalog.

### Frontend — `shopify-crud/`
Next.js 16.2.7 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui. Deployed to **Cloud Run** (service `shopify-crud`, region `southamerica-east1`), served publicly through **Firebase Hosting** (`firebase.json` rewrites `notimetowaste.lat` → that Cloud Run service — see `.firebaserc` for the project ID).

**Auth model:** NextAuth v5 with Credentials provider. Two hardcoded users (admin/user) from `.env`, plus file-based registered users stored in `data/users.json`. `middleware.ts` protects `/admin/*` — only `role: "admin"` can access. API routes enforce this via `auth()` from `auth.ts`.

**Data flow:** The frontend never calls an external e-commerce API. All product mutations go through Next.js API routes (`app/api/`), which proxy to the `watch*` Cloud Functions below. Endpoint URLs are centralized in `lib/config.ts`.

**Route structure:**
- `/` — public storefront (product cards)
- `/products/[id]` — product detail
- `/collections`, `/collections/[id]` — curated collections
- `/cart` — cart drawer (client-side, `CartProvider`)
- `/login`, `/register` — auth pages (animated clock on both)
- `/admin` — dashboard
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]` — CRUD
- `/admin/collections` — rule-based automatic collections
- `/admin/database` — raw BigQuery data view
- `/admin/resources` — GCS image upload
- `/admin/chat` — **ARIA**, a Claude-powered assistant for the admin
- `/admin/inventory` — stub, redirects to `/admin` (intentional dead route from a refactor)

Also notable: `components/DaniWidget.tsx` — a floating customer-facing chat widget on the storefront (separate from ARIA), and `app/api/ai/identify-watch` — Gemini Vision extracts brand/model/movement from a product photo to prefill the admin creation form.

### Cloud Functions — `cloud-functions/` (live, in use)
Five Cloud Functions (2nd gen, Node.js), all called only from `lib/config.ts`:

| Function | Purpose |
|---|---|
| `watchgetproducts` | GET — queries BigQuery, returns watch catalog |
| `watchcreateproduct` | POST — inserts a watch row in BigQuery |
| `watchupdateproduct` | PUT — updates a watch row |
| `watchdeleteproduct` | DELETE — deletes a watch row |
| `watchuploadimage` | POST — uploads image to GCS bucket `watch-product-images` |

None of these call Shopify. This is a direct CRUD over BigQuery.

### BigQuery schema (watches table)
Defined in `bigquery/watches_table.sql`. Key fields: `id`, `sku` (auto-numbered), `brand`, `model`, `price`, `compare_at_price`, `stock`, `stock_min_threshold`, `condition` (Nuevo/Vintage), `style` (Sport/Dress/Casual), `movement` (Cuarzo/Automático/Solar), `case_diameter_mm`, `case_material`, `strap_material`, `dial_color`, `water_resistance_m`, `gender`, `description`, `image_url`, `available`, `created_at`, `updated_at`. Migration `add_stock_threshold.sql` adds the threshold column. Low-stock crossings notify via a Google Chat webhook.

### ⚠️ Legacy / orphaned — do not build on these without checking first
The original Shopify pipeline this project started as is **dead code still deployed on GCP**, kept only for history:
- Live Cloud Run services `shopifygetproducts`, `shopifycreateproduct`, `shopifyupdateproduct`, `shopifydeleteproduct`, `shopifyuploadimage` — their **source was deleted from this repo** (2026-07-17 cleanup) since nothing calls them; they still exist in GCP and would need `gcloud`/Cloud Console to remove.
- Cloud Scheduler job `shopifyimporproduct-daily` (`southamerica-east1`, `0 2 * * *`, **ENABLED**) — still firing daily at a now-nonexistent purpose (it drove the old `shopifyimportproduct` sync). Worth disabling.
- Cloud Run services `shopify-crud` (region `northamerica-south1`, distinct from the live `southamerica-east1` one Firebase Hosting actually points to) and `relojescrud` — both look like abandoned early/duplicate deployments; unconfirmed, verify before touching.
- The old generic "products" BigQuery schema (`title`, `handle`, `image_link`, `synced_at`, Shopify GID as `id`) is superseded by the watches schema above.

## Environment variables
The root `.env` is used by `scripts/capture-retool.js` (Retool credentials — vestigial, see below). The `shopify-crud/.env` (not committed) needs:
```
ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL, USER_PASSWORD
AUTH_SECRET
NEXTAUTH_URL
```
Cloud Functions each need their own env vars set in GCP (`PROJECT_ID`, `DATASET_ID`, `TABLE_ID`, bucket name, etc. — check each function's `index.js`).

## Important notes
- **Next.js version:** `shopify-crud/AGENTS.md` warns this version has breaking changes vs. training data. Read `node_modules/next/dist/docs/` before writing Next.js code.
- `scripts/capture-retool.js` + `reference/retool/` are **vestigial** — leftovers from the very first design phase (cloning Retool's UI), superseded twice over by the current design system (see `design.md`). Harmless to keep, safe to delete if you want to tidy further.
- `data/users.json` is a flat-file user store written atomically in `lib/registeredUsers.ts`. Lives on the filesystem — not suitable for multi-instance deploys without shared storage.
