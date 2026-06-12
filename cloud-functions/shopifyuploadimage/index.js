import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const BUCKET = "shopify-product-images-m0ghu8";

export async function shopifyuploadimage(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { filename, contentType, data } = req.body;

  if (!data || !filename || !contentType) {
    return res.status(400).json({ error: "filename, contentType y data son requeridos" });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(contentType)) {
    return res.status(400).json({ error: "Solo se permiten JPG, PNG, WEBP o GIF" });
  }

  try {
    const buffer = Buffer.from(data, "base64");
    const ext = filename.split(".").pop() ?? "jpg";
    const gcsName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await storage.bucket(BUCKET).file(gcsName).save(buffer, { contentType });

    const url = `https://storage.googleapis.com/${BUCKET}/${gcsName}`;
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Upload error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
