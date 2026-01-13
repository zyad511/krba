import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/search", async (req, res) => {
  const q = req.query.q?.toLowerCase();
  if (!q) return res.json([]);

  try {
    let allScripts = [];

    for (let page = 1; page <= 3; page++) {
      const apiUrl = `https://rscripts.net/api/v2/scripts?page=${page}&orderBy=date&sort=desc`;
      const r = await fetch(apiUrl);
      const d = await r.json();
      allScripts = allScripts.concat(d.scripts);
    }

    const results = allScripts.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );

    res.json(results.slice(0, 15));
  } catch (e) {
    res.status(500).json({ error: "Search error" });
  }
});

app.listen(PORT, () => {
  console.log("KRB Site running on port", PORT);
});
