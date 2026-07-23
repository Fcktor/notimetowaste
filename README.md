# No Time To Waste

Tienda de relojes: storefront para clientes y back office de administración en una sola app Next.js, con los datos de producto viviendo en BigQuery y servidos a través de Cloud Functions en Google Cloud.

**En vivo:** https://notimetowaste.lat

## Arquitectura

El frontend nunca habla directamente con BigQuery. Cada lectura y escritura pasa por una Cloud Function dedicada, lo que mantiene las credenciales del lado del servidor y le da a cada operación su propia unidad de despliegue y su propio rastro de auditoría.

```
Next.js (App Router)
        │
        ├── rutas /api ──► Cloud Functions ──► BigQuery
        │                        │
        │                        └──► Cloud Storage (imágenes)
        │
        └── NextAuth v5 (sesión + rol)
```

| Cloud Function | Responsabilidad |
|---|---|
| `watchgetproducts` | Listar y filtrar el catálogo |
| `watchcreateproduct` | Crear un registro de reloj |
| `watchupdateproduct` | Actualizar campos y stock |
| `watchdeleteproduct` | Eliminar un registro |
| `watchuploadimage` | Subir imágenes a Cloud Storage |

## Funcionalidades

**Storefront** — catálogo, colecciones, detalle de producto, carrito, registro e inicio de sesión de clientes.

**Administración** — CRUD de productos con carga de imágenes, inventario con umbrales de stock bajo, gestión de colecciones, vista de base de datos y un asistente de IA para consultar el catálogo en lenguaje natural.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Base UI |
| Autenticación | NextAuth v5 |
| Almacén de datos | Google BigQuery |
| Cómputo | Google Cloud Functions |
| Almacenamiento | Google Cloud Storage |
| IA | Anthropic API, Google Generative AI |
| Correo | Nodemailer |
| Despliegue | Cloud Build, Firebase Hosting |

## Organización del repositorio

```
shopify-crud/          # Aplicación Next.js
├── app/
│   ├── admin/         # Back office (productos, inventario, colecciones, chat)
│   ├── api/           # Route handlers
│   ├── products/      # Catálogo y detalle
│   ├── collections/
│   ├── cart/
│   ├── login/
│   └── register/
├── components/
└── lib/

cloud-functions/       # Un directorio por función desplegada
bigquery/              # Definiciones de tablas y migraciones
public/
```

> El directorio de la aplicación todavía se llama `shopify-crud` por razones históricas: el proyecto empezó como un pipeline de datos de Shopify antes de convertirse en una tienda propia.

## Ejecutar localmente

```bash
pnpm install
pnpm dev
```

Requiere una cuenta de servicio de GCP con acceso a BigQuery y Cloud Storage, además de las variables de entorno que consumen `auth.config.ts` y las rutas de API.

## Despliegue

`cloudbuild.yaml` construye el contenedor definido en `Dockerfile`; `firebase.json` configura el hosting. Las Cloud Functions se despliegan de forma independiente desde `cloud-functions/`.
