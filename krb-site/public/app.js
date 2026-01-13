let failCount = {};

function copyTextLegacy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

async function searchScripts() {
  const q = searchInput.value.trim();
  results.innerHTML = "⏳ جاري البحث...";

  const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const d = await r.json();

  results.innerHTML = "";

  d.results.forEach(s => {
    failCount[s.rawScript] = 0;

    const card = document.createElement("div");
    card.className = "card";

    const code = `loadstring(game:HttpGet("${s.rawScript}"))()`;

    card.innerHTML = `
      <div class="code-box">
        <pre>${code}</pre>
      </div>

      ${s.image ? `<img src="${s.image}">` : ""}

      <h3>${s.title}</h3>
      <p>${s.description || "بدون وصف"}</p>

      <div class="meta">
        <span>${s.key ? "🔑 بمفتاح" : "✅ بدون مفتاح"}</span>
        <span>👁 ${s.views || 0}</span>
      </div>

      <button>📋 نسخ السكربت</button>
    `;

    const btn = card.querySelector("button");

    btn.onclick = async () => {
      try {
        copyTextLegacy(code);
        btn.textContent = "✅ تم النسخ";
        btn.classList.add("success");
      } catch {
        failCount[s.rawScript]++;
        btn.textContent = "❌ فشل النسخ";
        btn.classList.add("error");

        if (failCount[s.rawScript] >= 2) {
          window.open(s.rawScript, "_blank");
        }
      }

      setTimeout(() => {
        btn.textContent = "📋 نسخ السكربت";
        btn.classList.remove("success", "error");
      }, 1500);
    };

    results.appendChild(card);
  });
}
