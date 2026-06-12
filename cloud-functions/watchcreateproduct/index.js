import { BigQuery } from "@google-cloud/bigquery";
import { randomUUID } from "crypto";

const bigquery = new BigQuery();

function skuPrefix(brand) {
  return brand.toUpperCase().replace(/\s+/g, "").slice(0, 6);
}

async function nextSkuNumber(prefix) {
  const [rows] = await bigquery.query({
    query: `SELECT COUNT(*) AS cnt
            FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\`
            WHERE STARTS_WITH(sku, ?)`,
    params: [prefix + "-"],
  });
  const count = Number(rows[0]?.cnt ?? 0);
  return String(count + 1).padStart(4, "0");
}

export async function watchcreateproduct(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    brand, model, price, compare_at_price, stock,
    condition, style, movement, case_diameter_mm,
    case_material, strap_material, dial_color,
    water_resistance_m, gender, description, image_url, available,
  } = req.body;

  if (!brand || !model || price == null || !condition || !style) {
    return res.status(400).json({ error: "brand, model, price, condition y style son requeridos" });
  }

  try {
    const prefix = skuPrefix(brand);
    const num = await nextSkuNumber(prefix);
    const sku = `${prefix}-${num}`;
    const id = randomUUID();
    const now = new Date().toISOString();

    await bigquery.query({
      query: `INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\`
        (id, sku, brand, model, price, compare_at_price, stock,
         condition, style, movement, case_diameter_mm, case_material,
         strap_material, dial_color, water_resistance_m, gender,
         description, image_url, available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        id,
        sku,
        brand,
        model,
        parseFloat(price),
        compare_at_price != null ? parseFloat(compare_at_price) : null,
        parseInt(stock ?? 0),
        condition,
        style,
        movement ?? null,
        case_diameter_mm != null ? parseFloat(case_diameter_mm) : null,
        case_material ?? null,
        strap_material ?? null,
        dial_color ?? null,
        water_resistance_m != null ? parseInt(water_resistance_m) : null,
        gender ?? null,
        description ?? null,
        image_url ?? null,
        available !== false,
        now,
        now,
      ],
    });

    return res.status(201).json({ success: true, id, sku });
  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
