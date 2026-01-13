let failCount = {};

async function searchScripts() {
  const q = document.getElementById("searchInput").value.trim();
  const results = document.getElementById("results");
  results.innerHTML = "<p class='loading'>⏳ جاري البحث...</p>";

  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await r.json();

    results.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      results.innerHTML = "<p>❌ لا توجد نتائج</p>";
      return;
    }

    data.results.forEach(s => {
      failCount[s.rawScript] = 0;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="code-box">
          <pre>loadstring(game:HttpGet("${s.rawScript}"))()</pre>
        </div>

        ${s.image ? `<img src="${s.image}" alt="Script Image">` : ""}

        <h3>${s.title}</h3>
        <p>${s.description || "بدون وصف"}</p>

        <div class="meta">
          <span>${s.key ? "🔑 بمفتاح" : "✅ بدون مفتاح"}</span>
          <span>👁 ${s.views || 0}</span>
        </div>

        <button onclick="copyScript('${s.rawScript}', this)">
          📋 نسخ السكربت
        </button>
      `;

      results.appendChild(card);
    });

  } catch {
    results.innerHTML = "<p>❌ حدث خطأ أثناء البحث</p>";
  }
}

async function copyScript(url, btn) {
  try {
    const r = await fetch(`/api/raw?url=${encodeURIComponent(url)}`);
    const text = await r.text();

    if (!text) throw "";

    await navigator.clipboard.writeText(text);
    btn.textContent = "✅ تم النسخ";
    btn.classList.add("success");

    setTimeout(() => {
      btn.textContent = "📋 نسخ السكربت";
      btn.classList.remove("success");
    }, 1500);

  } catch {
    failCount[url]++;
    btn.textContent = "❌ فشل النسخ";
    btn.classList.add("error");

    if (failCount[url] >= 2) {
      window.open(url, "_blank");
    }

    setTimeout(() => {
      btn.textContent = "📋 نسخ السكربت";
      btn.classList.remove("error");
    }, 1500);
  }
}
