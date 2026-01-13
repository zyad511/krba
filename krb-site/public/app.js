function copyLegacy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

async function loadPopular() {
  const r = await fetch("/api/search");
  const d = await r.json();
  renderScripts(d.results, "🔥 السكربتات الشائعة");
}

async function searchScripts() {
  const q = searchInput.value.trim();
  const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const d = await r.json();
  renderScripts(d.results, "🔍 نتائج البحث");
}

function renderScripts(list, title) {
  results.innerHTML = `<h2 class="section">${title}</h2>`;

  if (!list.length) {
    results.innerHTML += `<p class="empty">لا توجد نتائج</p>`;
    return;
  }

  list.forEach(s => {
    const raw = s.rawScript || s.raw || "";
    if (!raw) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${s.image ? `<img src="${s.image}">` : ""}
      <div class="content">
        <h3>${s.title || "بدون عنوان"}</h3>
        <p>${s.description || "لا يوجد وصف"}</p>

        <div class="meta">
          <span>${s.key ? "🔑 Key" : "✅ No Key"}</span>
          <span>👁 ${s.views || 0}</span>
        </div>

        <button>📋 نسخ السكربت</button>
      </div>
    `;

    const btn = card.querySelector("button");
    let fails = 0;

    btn.onclick = () => {
      try {
        copyLegacy(`loadstring(game:HttpGet("${raw}"))()`);
        btn.textContent = "✅ تم النسخ";
      } catch {
        fails++;
        btn.textContent = "❌ فشل النسخ";
        if (fails >= 2) window.open(raw, "_blank");
      }
      setTimeout(() => (btn.textContent = "📋 نسخ السكربت"), 1500);
    };

    results.appendChild(card);
  });
}

// 🔥 تحميل الشائع أول ما يفتح الموقع
window.onload = loadPopular;
