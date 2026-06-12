import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

export async function watchdeleteproduct(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id es requerido" });

  try {
    await bigquery.query({
      query: `DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\`
              WHERE id = ?`,
      params: [id],
    });
    return res.status(200).json({ success: true, deletedId: id });
  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
