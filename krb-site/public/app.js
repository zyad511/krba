function copyLegacy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

async function searchScripts() {
  const q = searchInput.value.trim();
  results.innerHTML = `<div class="loader"></div>`;

  const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const d = await r.json();

  results.innerHTML = "";

  if (!d.results.length) {
    results.innerHTML = "<p class='empty'>❌ لا توجد نتائج</p>";
    return;
  }

  d.results.forEach(s => {
    const raw =
      s.rawScript || s.raw || s.script || "";

    if (!raw) return;

    const code = `loadstring(game:HttpGet("${raw}"))()`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="code-box"><pre>${code}</pre></div>
      ${s.image || s.image_url ? `<img src="${s.image || s.image_url}">` : ""}
      <h3>${s.title || "بدون عنوان"}</h3>
      <p>${s.description || "لا يوجد وصف"}</p>

      <div class="meta">
        <span>${s.key ? "🔑 Key" : "✅ No Key"}</span>
        <span>👁 ${s.views || 0}</span>
      </div>

      <button>📋 نسخ السكربت</button>
    `;

    const btn = card.querySelector("button");
    let fails = 0;

    btn.onclick = () => {
      try {
        copyLegacy(code);
        btn.textContent = "✅ تم النسخ";
        btn.className = "success";
      } catch {
        fails++;
        btn.textContent = "❌ فشل النسخ";
        btn.className = "error";
        if (fails >= 2) window.open(raw, "_blank");
      }

      setTimeout(() => {
        btn.textContent = "📋 نسخ السكربت";
        btn.className = "";
      }, 1500);
    };

    results.appendChild(card);
  });
}
