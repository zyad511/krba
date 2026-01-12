import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ملفات الموقع الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// API بحث السكربتات
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const apiUrl = "https://rscripts.net/api/v2/scripts?page=1&orderBy=date&sort=desc";
    const response = await fetch(apiUrl);
    const data = await response.json();

    // فلترة السكربتات
    const results = data.scripts.filter(s =>
      s.title.toLowerCase().includes(q.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(q.toLowerCase()))
    );

    res.json(results.slice(0, 15)); // أعلى 15 نتيجة
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// صفحة رئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🌐 KRB Site running on port ${PORT}`);
});
