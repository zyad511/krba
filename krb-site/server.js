import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public"), { maxAge: 0 }));

async function translate(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" +
      encodeURIComponent(text);
    const r = await fetch(url);
    const d = await r.json();
    return d[0].map(x => x[0]).join("");
  } catch {
    return text;
  }
}

/* RAW */
app.get("/api/raw", async (req, res) => {
  try {
    const r = await fetch(req.query.url);
    const t = await r.text();
    res.send(t);
  } catch {
    res.send("");
  }
});

/* SEARCH + POPULAR */
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";

    let scripts = [];
    for (let i = 1; i <= 8; i++) {
      const r = await fetch(`https://rscripts.net/api/v2/scripts?page=${i}`);
      const d = await r.json();
      if (Array.isArray(d.scripts)) scripts.push(...d.scripts);
    }

    // 🔥 إذا ما فيه بحث → سكربتات شائعة
    if (!q.trim()) {
      scripts.sort((a, b) => (b.views || 0) - (a.views || 0));
      return res.json({
        mode: "popular",
        results: scripts.slice(0, 24)
      });
    }

    // 🔍 بحث عادي
    const en = await translate(q);

    let results = scripts.filter(s =>
      (s.title || "").toLowerCase().includes(en.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(en.toLowerCase())
    );

    results.sort((a, b) => (b.views || 0) - (a.views || 0));

    res.json({
      mode: "search",
      results: results.slice(0, 24)
    });

  } catch {
    res.json({ results: [] });
  }
});

app.listen(PORT, () => console.log("✅ Server Running"));
