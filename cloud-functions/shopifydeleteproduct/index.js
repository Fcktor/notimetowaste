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

export async function shopifydeleteproduct(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id es requerido" });

  try {
    const token = await getShopifyToken();
    const numericId = extractNumericId(id);

    // Eliminar en Shopify — si ya no existe (404) continuamos igual
    try {
      await axios.delete(
        `https://${process.env.SHOP_NAME}/admin/api/2024-01/products/${numericId}.json`,
        { httpsAgent, headers: { "X-Shopify-Access-Token": token } }
      );
    } catch (shopifyErr) {
      if (shopifyErr?.response?.status !== 404) {
        throw shopifyErr;
      }
    }

    // Eliminar en BigQuery — si está en streaming buffer, ignorar el error
    try {
      await bigquery.query({
        query: `DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\` WHERE id = ?`,
        params: [id],
      });
    } catch (bqErr) {
      const msg = bqErr?.message ?? "";
      if (!msg.includes("streaming buffer")) {
        throw bqErr;
      }
      // Streaming buffer: el producto se limpiará en el próximo sync (~90 min)
      console.warn("BigQuery streaming buffer activo — se limpiará en el próximo sync:", id);
    }

    return res.status(200).json({ success: true, deletedId: id });
  } catch (err) {
    const detail = err?.response?.data ?? err?.errors ?? err?.message ?? String(err);
    console.error("ERROR:", JSON.stringify(detail));
    return res.status(500).json({ error: detail });
  }
}
