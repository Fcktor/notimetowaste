# CRUD Design — Replica de Retool con Playwright + Next.js

## Objetivo

Usar Playwright para capturar y analizar la UI de Retool como referencia de diseño,
replicar esa interfaz en Next.js, y conectarla a las Cloud Functions del proyecto
Shopify/GCP para gestionar productos.

---

## Contexto del proyecto base

| Recurso | Valor |
|---|---|
| Tienda | m0ghu8-yk.myshopify.com |
| Cloud Function GET | https://shopifygetproducts-891152758094.southamerica-east1.run.app |
| Cloud Function SYNC | https://shopifyimportproduct-891152758094.southamerica-east1.run.app |
| BigQuery dataset | project-7ae3e02e / m0ghu8_123 / products |
| Shopify API version | 2026-04 |

---

## Flujo general

```
[Fase 1 — Captura con Playwright]
       │
       ▼
  Navegar retool.com → screenshot de tabla, form, modal
  Extraer colores, tipografía, layout, componentes clave
       │
       ▼
[Fase 2 — Réplica en Next.js]
       │
       ▼
  Construir tabla + formulario + modales replicando el estilo Retool
       │
       ▼
[Fase 3 — Conexión a Cloud Functions]
       │
       ├── GET    /products  ──► shopifygetproducts (BigQuery)
       ├── POST   /products  ──► shopifycreateproduct (Shopify + BQ)
       ├── PUT    /products/:id  ──► shopifyupdateproduct (Shopify + BQ)
       └── DELETE /products/:id  ──► shopifydeleteproduct (Shopify + BQ)
```

---

## Fase 1 — Captura con Playwright

### Objetivo
Capturar screenshots y estructura DOM de las vistas principales de Retool
para usarlas como referencia visual al construir el frontend.

### Script de captura

```typescript
// scripts/capture-retool.ts
import { chromium } from 'playwright';
import path from 'path';

const RETOOL_URL = 'https://retool.com';
const OUT_DIR = './reference/retool';

async function captureRetoolUI() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Página principal — vista general del producto
  await page.goto(`${RETOOL_URL}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(OUT_DIR, '01-home.png'),
    fullPage: false
  });

  // 2. Capturar componente tabla (desde demos públicas)
  await page.goto(`${RETOOL_URL}/components/table`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(OUT_DIR, '02-table-component.png'),
    fullPage: true
  });

  // 3. Capturar formularios
  await page.goto(`${RETOOL_URL}/components/form`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(OUT_DIR, '03-form-component.png'),
    fullPage: true
  });

  // 4. Extraer tokens de diseño (colores, fuentes)
  const designTokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      fontFamily: styles.fontProperty || styles.fontFamily,
      colors: {
        primary: styles.getPropertyValue('--color-primary').trim(),
        background: styles.getPropertyValue('--color-background').trim(),
        text: styles.getPropertyValue('--color-text').trim(),
      }
    };
  });
  console.log('Design tokens:', JSON.stringify(designTokens, null, 2));

  await browser.close();
  console.log(`Screenshots guardados en ${OUT_DIR}`);
}

captureRetoolUI();
```

### Referencia de diseño Retool a replicar

| Elemento | Descripción |
|---|---|
| Tabla | Encabezados en gris oscuro, filas alternas, botones de acción inline |
| Formulario | Labels arriba del input, inputs con borde gris, botón primario azul |
| Modal eliminar | Overlay oscuro, card centrado, botones "Cancelar" / "Eliminar" en rojo |
| Colores | Primario `#3D63DD`, fondo `#F8F8F8`, texto `#1C2024` |
| Fuente | Inter (sans-serif) |
| Sidebar | Fondo `#1F2937`, items con hover gris |

---

## Fase 2 — Réplica en Next.js

### Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui (base) |
| HTTP client | fetch nativo |
| Testing E2E | Playwright |

### Estructura de archivos

```
shopify-crud/
├── app/
│   ├── layout.tsx                  ← sidebar estilo Retool
│   ├── page.tsx                    ← tabla de productos
│   ├── products/
│   │   ├── new/page.tsx            ← form crear
│   │   └── [id]/page.tsx           ← form editar
│   └── api/
│       ├── products/route.ts       ← GET + POST
│       └── products/[id]/route.ts  ← PUT + DELETE
├── components/
│   ├── Sidebar.tsx                 ← navegación estilo Retool
│   ├── ProductTable.tsx            ← tabla con acciones
│   ├── ProductForm.tsx             ← form crear/editar
│   └── DeleteModal.tsx             ← modal confirmación
├── reference/
│   └── retool/                     ← screenshots capturados en Fase 1
├── scripts/
│   └── capture-retool.ts           ← script de captura Playwright
├── tests/
│   └── products.spec.ts            ← E2E tests
└── playwright.config.ts
```

### Layout base (replica Retool sidebar)

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex h-screen bg-[#F8F8F8] font-[Inter]">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </body>
    </html>
  );
}
```

### Tabla de productos (estilo Retool)

```tsx
// components/ProductTable.tsx
export function ProductTable({ products }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Título</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Precio</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Handle</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900">{p.title}</td>
              <td className="px-4 py-3 text-gray-600">${p.price}</td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.handle}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <a href={`/products/${p.id}`}
                   className="text-[#3D63DD] hover:underline text-xs font-medium">
                  Editar
                </a>
                <DeleteModal productId={p.id} productTitle={p.title} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Fase 3 — Cloud Functions a crear

### `shopifycreateproduct`

```javascript
// index.js
import { BigQuery } from '@google-cloud/bigquery';
import axios from 'axios';

const bigquery = new BigQuery();

async function getShopifyToken() {
  const { data } = await axios.post('https://api.shopify.com/auth/access_token', {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  return data.access_token;
}

export async function shopifycreateproduct(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).send('');

  const { title, description, price } = req.body;
  const token = await getShopifyToken();

  const mutation = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product { id title handle }
        userErrors { field message }
      }
    }`;

  const { data } = await axios.post(
    `https://${process.env.SHOP_NAME}.myshopify.com/api/2026-04/graphql.json`,
    { query: mutation, variables: { input: { title, descriptionHtml: description } } },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const product = data.data.productCreate.product;

  await bigquery
    .dataset(process.env.DATASET_ID)
    .table(process.env.TABLE_ID)
    .insert([{ id: product.id, title: product.title, handle: product.handle,
               description, price, image_url: '', synced_at: new Date().toISOString() }]);

  res.json({ success: true, product });
}
```

### `shopifyupdateproduct` — misma estructura, usa mutation `productUpdate`
### `shopifydeleteproduct` — misma estructura, usa mutation `productDelete` + `DELETE FROM` en BigQuery

---

## Schema de producto

```typescript
interface Product {
  id: string;          // gid://shopify/Product/123
  title: string;
  description: string;
  price: string;
  image_url: string;
  handle: string;
  synced_at: string;
}
```

---

## Tests E2E con Playwright

```typescript
// tests/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CRUD Productos — Replica Retool', () => {

  test('listar productos', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('table tbody tr')).not.toHaveCount(0);
  });

  test('crear producto', async ({ page }) => {
    await page.goto('/products/new');
    await page.fill('[name="title"]', 'Producto Test E2E');
    await page.fill('[name="price"]', '99.99');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('table')).toContainText('Producto Test E2E');
  });

  test('editar producto', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Editar >> nth=0');
    await page.fill('[name="price"]', '149.99');
    await page.click('button[type="submit"]');
    await expect(page.locator('table')).toContainText('149.99');
  });

  test('eliminar producto', async ({ page }) => {
    await page.goto('/');
    const before = await page.locator('table tbody tr').count();
    await page.click('text=Eliminar >> nth=0');
    await page.click('text=Confirmar');
    await expect(page.locator('table tbody tr')).toHaveCount(before - 1);
  });

});
```

---

## Pasos de implementación

### Fase 1 — Captura
- [ ] `npm init` + instalar Playwright (`npm i -D playwright`)
- [ ] Ejecutar `capture-retool.ts` → guardar screenshots en `/reference/retool/`
- [ ] Revisar screenshots y definir paleta de colores / layout final

### Fase 2 — Frontend
- [ ] `npx create-next-app shopify-crud --tailwind --app`
- [ ] Instalar shadcn/ui base (`npx shadcn@latest init`)
- [ ] Construir `Sidebar`, `ProductTable`, `ProductForm`, `DeleteModal`
- [ ] Conectar página `/` a Cloud Function GET existente
- [ ] Conectar formulario crear/editar a Cloud Functions nuevas

### Fase 3 — Cloud Functions
- [ ] Crear `shopifycreateproduct` en Cloud Run functions
- [ ] Crear `shopifyupdateproduct`
- [ ] Crear `shopifydeleteproduct`

### Fase 4 — Tests y Deploy
- [ ] Escribir tests E2E en `tests/products.spec.ts`
- [ ] Deploy frontend en Vercel
- [ ] Ejecutar `npx playwright test`
