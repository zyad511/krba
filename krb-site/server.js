import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ترجمة أي لغة → إنجليزي
async function translateToEnglish(text) {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: "en"
      })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
}

// البحث
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ results: [] });

  try {
    const translated = await translateToEnglish(query);
    const keyword = translated.toLowerCase();

    let scripts = [];

    for (let page = 1; page <= 6; page++) {
      const r = await fetch(
        `https://rscripts.net/api/v2/scripts?page=${page}&orderBy=date&sort=desc`
      );
      const d = await r.json();
      if (d.scripts) scripts.push(...d.scripts);
    }

    const results = scripts.filter(s =>
      s.title?.toLowerCase().includes(keyword) ||
      s.description?.toLowerCase().includes(keyword)
    );

    res.json({
      original: query,
      translated,
      results: results.slice(0, 20)
    });
  } catch (e) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log("✅ KRB Site running on port", PORT);
});
