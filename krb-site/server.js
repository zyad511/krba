import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public"), { maxAge: 0 }));
app.use(express.json());

async function translate(text, to = "en") {
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=` +
      encodeURIComponent(text);
    const r = await fetch(url);
    const d = await r.json();
    return d[0].map(x => x[0]).join("");
  } catch {
    return text;
  }
}

app.get("/api/raw", async (req, res) => {
  try {
    const r = await fetch(req.query.url);
    const text = await r.text();
    res.send(text);
  } catch {
    res.send("");
  }
});

app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ results: [] });

  try {
    const en = await translate(q, "en");

    let all = [];
    for (let i = 1; i <= 6; i++) {
      const r = await fetch(`https://rscripts.net/api/v2/scripts?page=${i}`);
      const d = await r.json();
      if (d.scripts) all.push(...d.scripts);
    }

    const key = en.toLowerCase();

    let results = all.filter(
      s =>
        s.title?.toLowerCase().includes(key) ||
        s.description?.toLowerCase().includes(key)
    );

    // 🔥 ترتيب حسب المشاهدات
    results.sort((a, b) => (b.views || 0) - (a.views || 0));

    res.json({ results: results.slice(0, 20) });
  } catch {
    res.status(500).json({ results: [] });
  }
});

app.listen(PORT, () =>
  console.log("✅ KRB Site running on port", PORT)
);
