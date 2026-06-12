# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

This is a **Shopify product management system** on GCP, split into two layers:

### Frontend — `shopify-crud/`
Next.js 15 (App Router) + Tailwind CSS v4 + shadcn/ui, styled to replicate Retool's UI. Deployed to Cloud Run via `cloudbuild.yaml`.

**Auth model:** NextAuth v5 with Credentials provider. Two hardcoded users (admin/user) from `.env`, plus file-based registered users stored in `data/users.json`. The middleware (`middleware.ts`) protects `/admin/*` routes — only `role: "admin"` can access them. API routes enforce this via `auth()` from `auth.ts`.

**Data flow:** The frontend never calls Shopify directly. All mutations go through Next.js API routes (`app/api/`), which proxy to the corresponding Cloud Function. Endpoint URLs are centralized in `lib/config.ts`.

**Route structure:**
- `/` — public storefront (product cards)
- `/admin/products` — admin table with create/edit/delete
- `/admin/products/new` and `/admin/products/[id]` — product forms
- `/admin/database` — raw BigQuery data view
- `/admin/resources` — GCS image upload
- `/cart` — cart drawer (client-side only, no persistence)
- `/login`, `/register` — auth pages

### Cloud Functions — `cloud-functions/`
Five independently deployed GCP Cloud Functions (2nd gen, Node.js):

| Function | Purpose |
|---|---|
| `shopifygetproducts` | GET — queries BigQuery, returns product list |
| `shopifyimportproduct` | POST — bulk-syncs products from Shopify to BigQuery |
| `shopifycreateproduct` | POST — creates product in Shopify REST API + inserts row in BigQuery |
| `shopifyupdateproduct` | PUT — updates Shopify product + BigQuery row |
| `shopifydeleteproduct` | DELETE — deletes from Shopify + BigQuery |
| `shopifyuploadimage` | POST — uploads image to GCS bucket |

All functions authenticate to Shopify using OAuth client credentials (`CLIENT_ID` + `CLIENT_SECRET` env vars) to get a short-lived access token per request.

### BigQuery schema (products table)
Key fields: `id` (Shopify GID), `title`, `description`, `price` (FLOAT), `compare_at_price`, `availability`, `image_link`, `link`, `brand`, `sku`, `barcode`, `synced_at`.

## Environment variables
The root `.env` is used by Playwright scripts. The `shopify-crud/.env` (not committed) needs:
```
ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL, USER_PASSWORD
AUTH_SECRET
NEXTAUTH_URL
```
Cloud Functions each need their own env vars set in GCP: `PROJECT_ID`, `DATASET_ID`, `TABLE_ID`, `SHOP_NAME`, `CLIENT_ID`, `CLIENT_SECRET`.

## Important notes
- **Next.js version:** `shopify-crud/AGENTS.md` warns that this version has breaking changes. Read `node_modules/next/dist/docs/` before writing Next.js code — don't rely on training data.
- The `scripts/capture-retool.js` at root uses Playwright to screenshot Retool's UI for design reference; outputs go to `reference/retool/`.
- `data/users.json` is a flat-file user store written atomically in `lib/registeredUsers.ts`. It lives on the filesystem — not suitable for multi-instance deploys without shared storage.
