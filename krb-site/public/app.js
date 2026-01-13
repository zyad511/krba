async function searchScripts() {
  const input = document.getElementById("searchInput");
  const resultsDiv = document.getElementById("results");

  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "<p class='loading'>🔍 جاري البحث...</p>";

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  resultsDiv.innerHTML = "";

  if (!data.results || data.results.length === 0) {
    resultsDiv.innerHTML = "<p>❌ لا توجد نتائج</p>";
    return;
  }

  data.results.forEach(script => {
    const card = document.createElement("div");
    card.className = "script-card";

    const keyStatus = script.key ? "🔑 بمفتاح" : "✅ بدون مفتاح";

    card.innerHTML = `
      <h3>${script.title}</h3>
      <p>${script.description || "بدون وصف"}</p>

      ${script.image ? `<img src="${script.image}">` : ""}

      <div class="info">
        <span>${keyStatus}</span>
        <span>👁️ ${script.views || 0}</span>
      </div>

      <button onclick="copyScript('${script.rawScript}')">
        📋 نسخ السكربت
      </button>
    `;

    resultsDiv.appendChild(card);
  });
}

/* =======================
   نسخ فعلي 100%
======================= */
async function copyScript(url) {
  const res = await fetch(`/api/raw?url=${encodeURIComponent(url)}`);
  const text = await res.text();

  if (!text) {
    alert("❌ فشل النسخ");
    return;
  }

  await navigator.clipboard.writeText(text);
  alert("✅ تم نسخ السكربت");
}
