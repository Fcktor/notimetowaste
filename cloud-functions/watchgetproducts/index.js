import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

export async function watchgetproducts(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const [rows] = await bigquery.query({
      query: `SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\`
              ORDER BY created_at DESC`,
    });
    return res.status(200).json({ products: rows });
  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
