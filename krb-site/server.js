import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔁 ترجمة أي لغة → إنجليزي
async function translateToEnglish(text) {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: "en",
        format: "text"
      })
    });

    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    return text; // لو فشلت الترجمة نكمل عادي
  }
}

// 🔍 API البحث
app.get("/api/search", async (req, res) => {
  let query = req.query.q;
  if (!query) return res.json([]);

  try {
    // 1️⃣ نترجم
    const translated = await translateToEnglish(query);
    const q = translated.toLowerCase();

    let allScripts = [];

    // 2️⃣ نجيب أكثر من صفحة
    for (let page = 1; page <= 4; page++) {
      const apiUrl = `https://rscripts.net/api/v2/scripts?page=${page}&orderBy=date&sort=desc`;
      const r = await fetch(apiUrl);
      const d = await r.json();
      allScripts = allScripts.concat(d.scripts || []);
    }

    // 3️⃣ فلترة النتائج
    const results = allScripts.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );

    res.json({
      original: query,
      translated,
      results: results.slice(0, 15)
    });

  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log("🔥 KRB Site running on port", PORT);
});
