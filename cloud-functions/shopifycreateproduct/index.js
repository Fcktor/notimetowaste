import { BigQuery } from "@google-cloud/bigquery";
import axios from "axios";
import https from "https";

const bigquery = new BigQuery();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getShopifyToken() {
  const { data } = await axios.post(
    `https://${process.env.SHOP_NAME}/admin/oauth/access_token`,
    { client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, grant_type: "client_credentials" },
    { httpsAgent }
  );
  return data.access_token;
}

export async function shopifycreateproduct(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { title, description, price, quantity, image_link } = req.body;
  if (!title || !price) return res.status(400).json({ error: "title y price son requeridos" });

  try {
    const token = await getShopifyToken();

    const productBody = { title, body_html: description ?? "", variants: [{ price: String(price) }] };
    if (image_link) productBody.images = [{ src: image_link }];

    const { data } = await axios.post(
      `https://${process.env.SHOP_NAME}/admin/api/2024-01/products.json`,
      { product: productBody },
      { httpsAgent, headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } }
    );

    const p = data.product;
    const variant = p.variants?.[0] ?? {};
    const finalQuantity = quantity != null ? parseInt(quantity) : 0;

    // Setear cantidad en inventario de Shopify (requiere read_locations + write_inventory scope)
    if (quantity != null && variant.inventory_item_id) {
      try {
        const locRes = await axios.get(
          `https://${process.env.SHOP_NAME}/admin/api/2024-01/locations.json`,
          { httpsAgent, headers: { "X-Shopify-Access-Token": token } }
        );
        const locationId = locRes.data.locations?.[0]?.id;
        if (locationId) {
          await axios.post(
            `https://${process.env.SHOP_NAME}/admin/api/2024-01/inventory_levels/set.json`,
            { location_id: locationId, inventory_item_id: variant.inventory_item_id, available: finalQuantity },
            { httpsAgent, headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } }
          );
        }
      } catch (invErr) {
        console.warn("Inventory API no disponible (scope faltante):", invErr?.response?.data ?? invErr.message);
      }
    }

    const projectId = process.env.PROJECT_ID;
    const dataset = process.env.DATASET_ID;
    const table = process.env.TABLE_ID;

    // DML INSERT evita el streaming buffer — permite DELETE/UPDATE inmediato
    await bigquery.query({
      query: `INSERT INTO \`${projectId}.${dataset}.${table}\`
        (id, title, description, price, compare_at_price, availability, image_link, link, brand, sku, barcode, variant_id, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        p.admin_graphql_api_id,
        p.title,
        description ?? "",
        parseFloat(price),
        0.0,
        "in stock",
        image_link || p.image?.src || p.images?.[0]?.src || "",
        `https://${process.env.SHOP_NAME}/products/${p.handle}`,
        p.vendor ?? "",
        variant.sku ?? "",
        variant.barcode ?? "",
        variant.admin_graphql_api_id ?? "",
        finalQuantity,
      ],
    });

    return res.status(201).json({ success: true, product: p });
  } catch (err) {
    const detail = err?.response?.data ?? err?.errors ?? err?.message ?? String(err);
    console.error("ERROR:", JSON.stringify(detail));
    return res.status(500).json({ error: detail });
  }
}
