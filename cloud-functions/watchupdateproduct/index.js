import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

const UPDATABLE = [
  "brand", "model", "price", "compare_at_price", "stock",
  "condition", "style", "movement", "case_diameter_mm", "case_material",
  "strap_material", "dial_color", "water_resistance_m", "gender",
  "description", "image_url", "available",
];

export async function watchupdateproduct(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, ...fields } = req.body;
  if (!id) return res.status(400).json({ error: "id es requerido" });

  const setClauses = [];
  const params = [];

  for (const key of UPDATABLE) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      if (key === "price" || key === "compare_at_price") {
        params.push(fields[key] != null ? parseFloat(fields[key]) : null);
      } else if (key === "stock" || key === "case_diameter_mm" || key === "water_resistance_m") {
        params.push(fields[key] != null ? parseInt(fields[key]) : null);
      } else if (key === "available") {
        params.push(Boolean(fields[key]));
      } else {
        params.push(fields[key] ?? null);
      }
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  setClauses.push("updated_at = ?");
  params.push(new Date().toISOString());
  params.push(id);

  try {
    await bigquery.query({
      query: `UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\`
              SET ${setClauses.join(", ")} WHERE id = ?`,
      params,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
