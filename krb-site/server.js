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

/* =======================
   ترجمة Google (مستقرة)
======================= */
async function translateToEnglish(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" +
      encodeURIComponent(text);

    const r = await fetch(url);
    const data = await r.json();

    return data[0].map(item => item[0]).join("");
  } catch {
    return text;
  }
}

/* =======================
   نسخ السكربت (حل CORS)
======================= */
app.get("/api/raw", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("");

  try {
    const r = await fetch(url);
    const text = await r.text();
    res.send(text);
  } catch {
    res.send("");
  }
});

/* =======================
   البحث
======================= */
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

    // البحث يشمل العناوين والوصف بالإنجليزية والعربية
    const results = scripts.filter(s =>
      (s.title?.toLowerCase().includes(keyword)) ||
      (s.description?.toLowerCase().includes(keyword)) ||
      (s.title_ar?.toLowerCase().includes(keyword)) ||
      (s.description_ar?.toLowerCase().includes(keyword))
    );

    // ترتيب حسب المشاهدات
    results.sort((a, b) => (b.views || 0) - (a.views || 0));

    res.json({
      original: query,
      translated,
      results: results.slice(0, 20)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log("✅ KRB Site running on port", PORT);
});
