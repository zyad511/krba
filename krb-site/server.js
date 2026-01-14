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
    return data[0].map(item => item[0]).join("");
  } catch {
    return text;
  }
}

/* =======================
   البحث (بدون ترجمة النتائج)
======================= */
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ results: [] });

  try {
    // ترجمة كلمة البحث فقط
    const translated = await translateToEnglish(query);
    const keyword = translated.toLowerCase();

    let scripts = [];

    // تقليل الصفحات لتحسين السرعة
    for (let page = 1; page <= 4; page++) {
      const r = await fetch(
        `https://rscripts.net/api/v2/scripts?page=${page}&orderBy=date&sort=desc`
      );

      if (!r.ok) continue;

      const d = await r.json();
      if (Array.isArray(d.scripts)) {
        scripts.push(...d.scripts);
      }
    }

    // فلترة ذكية (إنجليزي + عربي بدون تعديل العرض)
    const results = scripts.filter(s => {
      const title = (s.title || "").toLowerCase();
      const desc = (s.description || "").toLowerCase();
      const titleAr = (s.title_ar || "").toLowerCase();
      const descAr = (s.description_ar || "").toLowerCase();

      return (
        title.includes(keyword) ||
        desc.includes(keyword) ||
        titleAr.includes(keyword) ||
        descAr.includes(keyword)
      );
    });

    // ترتيب حسب الأكثر مشاهدة
    results.sort((a, b) => (b.views || 0) - (a.views || 0));

    res.json({
      query,
      results: results.slice(0, 20)
    });
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log("✅ KRB Site running on port", PORT);
});
