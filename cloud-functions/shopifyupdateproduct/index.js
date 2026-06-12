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

function extractNumericId(gid) {
  return gid.split("/").pop();
}

export async function shopifyupdateproduct(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, title, description, price, quantity, image_link } = req.body;
  if (!id) return res.status(400).json({ error: "id es requerido" });

  try {
    const token = await getShopifyToken();
    const numericId = extractNumericId(id);

    const productPayload = {};
    if (title) productPayload.title = title;
    if (description !== undefined) productPayload.body_html = description;
    if (price !== undefined) productPayload.variants = [{ price: String(price) }];
    if (image_link !== undefined) productPayload.images = [{ src: image_link }];

    const { data } = await axios.put(
      `https://${process.env.SHOP_NAME}/admin/api/2024-01/products/${numericId}.json`,
      { product: productPayload },
      { httpsAgent, headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } }
    );

    const p = data.product;
    const projectId = process.env.PROJECT_ID;
    const dataset = process.env.DATASET_ID;
    const table = process.env.TABLE_ID;

    // Actualizar cantidad en Shopify via Inventory API (requiere read_locations + write_inventory scope)
    let finalQuantity = null;
    if (quantity != null) {
      finalQuantity = parseInt(quantity);
      const inventoryItemId = p.variants?.[0]?.inventory_item_id;
      if (inventoryItemId) {
        try {
          const locRes = await axios.get(
            `https://${process.env.SHOP_NAME}/admin/api/2024-01/locations.json`,
            { httpsAgent, headers: { "X-Shopify-Access-Token": token } }
          );
          const locationId = locRes.data.locations?.[0]?.id;
          if (locationId) {
            await axios.post(
              `https://${process.env.SHOP_NAME}/admin/api/2024-01/inventory_levels/set.json`,
              { location_id: locationId, inventory_item_id: inventoryItemId, available: finalQuantity },
              { httpsAgent, headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } }
            );
          }
        } catch (invErr) {
          console.warn("Inventory API no disponible (scope faltante):", invErr?.response?.data ?? invErr.message);
        }
      }
    }

    const setClauses = [];
    const params = [];
    if (title) { setClauses.push("title = ?"); params.push(title); }
    if (description !== undefined) { setClauses.push("description = ?"); params.push(description); }
    if (price !== undefined) { setClauses.push("price = ?"); params.push(parseFloat(price)); }
    if (finalQuantity !== null) { setClauses.push("quantity = ?"); params.push(finalQuantity); }
    if (image_link !== undefined) { setClauses.push("image_link = ?"); params.push(image_link); }
    params.push(id);

    if (setClauses.length > 0) {
      await bigquery.query({
        query: `UPDATE \`${projectId}.${dataset}.${table}\` SET ${setClauses.join(", ")} WHERE id = ?`,
        params,
      });
    }

    return res.status(200).json({ success: true, product: p });
  } catch (err) {
    const detail = err?.response?.data ?? err?.errors ?? err?.message ?? String(err);
    console.error("ERROR:", JSON.stringify(detail));
    return res.status(500).json({ error: detail });
  }
}
