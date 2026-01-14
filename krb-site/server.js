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
   ترجمة كلمة البحث فقط
======================= */
async function translateToEnglish(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" +
      encodeURIComponent(text);

    const r = await fetch(url);
    const data = await r.json();
    return data[0].map(i => i[0]).join("");
  } catch {
    return text;
  }
}

/* =======================
   جلب السكربتات من rscripts
======================= */
async function fetchScripts(pages = 4) {
  let scripts = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const r = await fetch(
        `https://rscripts.net/api/v2/scripts?page=${page}&orderBy=views&sort=desc`
      );
      if (!r.ok) continue;

      const d = await r.json();
      if (Array.isArray(d.scripts)) {
        scripts.push(...d.scripts);
      }
    } catch {}
  }

  return scripts;
}

/* =======================
   البحث + الشائعة
======================= */
app.get("/api/search", async (req, res) => {
  const query = req.query.q?.trim();

  try {
    // 🔥 لو ما في بحث → سكربتات شائعة
    if (!query) {
      const scripts = await fetchScripts(3);

      scripts.sort((a, b) => (b.views || 0) - (a.views || 0));

      return res.json({
        mode: "popular",
        results: scripts.slice(0, 20)
      });
    }

    // 🔍 بحث عادي
    const translated = await translateToEnglish(query);
    const keyword = translated.toLowerCase();

    const scripts = await fetchScripts(4);

    const results = scripts.filter(s => {
      const fields = [
        s.title,
        s.description,
        s.title_ar,
        s.description_ar
      ];

      return fields.some(f =>
        (f || "").toLowerCase().includes(keyword)
      );
    });

    results.sort((a, b) => (b.views || 0) - (a.views || 0));

    res.json({
      mode: "search",
      query,
      results: results.slice(0, 20)
    });
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log("✅ KRB Site running on port", PORT);
});
