# No Time To Waste

A watch e-commerce store: customer storefront and admin back office in one Next.js app, with product data living in BigQuery and served through Cloud Functions on Google Cloud.

**Live:** https://notimetowaste.lat

## Architecture

The frontend never talks to BigQuery directly. Every read and write goes through a dedicated Cloud Function, which keeps credentials server-side and gives each operation its own deploy unit and audit trail.

```
Next.js (App Router)
        │
        ├── /api routes ──► Cloud Functions ──► BigQuery
        │                        │
        │                        └──► Cloud Storage (product images)
        │
        └── NextAuth v5 (session + role)
```

| Cloud Function | Responsibility |
|---|---|
| `watchgetproducts` | List and filter the catalog |
| `watchcreateproduct` | Create a watch record |
| `watchupdateproduct` | Update fields and stock |
| `watchdeleteproduct` | Remove a record |
| `watchuploadimage` | Push product images to Cloud Storage |

## Features

**Storefront** — catalog, collections, product detail, cart, customer registration and login.

**Admin** — product CRUD with image upload, inventory with low-stock thresholds, collection management, a database view, and an AI assistant for querying the catalog in natural language.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Base UI |
| Auth | NextAuth v5 |
| Data warehouse | Google BigQuery |
| Compute | Google Cloud Functions |
| Storage | Google Cloud Storage |
| AI | Anthropic API, Google Generative AI |
| Email | Nodemailer |
| Deploy | Cloud Build, Firebase Hosting |

## Repository layout

```
shopify-crud/          # Next.js application
├── app/
│   ├── admin/         # Back office (products, inventory, collections, chat)
│   ├── api/           # Route handlers
│   ├── products/      # Catalog and detail pages
│   ├── collections/
│   ├── cart/
│   ├── login/
│   └── register/
├── components/
└── lib/

cloud-functions/       # One directory per deployed function
bigquery/              # Table definitions and migrations
public/
```

> The application directory is still named `shopify-crud` for historical reasons — the project started as a Shopify data pipeline before becoming a standalone store.

## Running locally

```bash
pnpm install
pnpm dev
```

Requires a GCP service account with BigQuery and Cloud Storage access, plus the environment variables consumed by `auth.config.ts` and the API routes.

## Deployment

`cloudbuild.yaml` builds the container defined in `Dockerfile`; `firebase.json` configures hosting. Cloud Functions deploy independently from `cloud-functions/`.
