async function searchScripts() {
  const input = document.getElementById("searchInput");
  const resultsDiv = document.getElementById("results");

  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "<p class='loading'>🔍 جاري البحث...</p>";

  try {
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
      const rawUrl = encodeURIComponent(script.rawScript || "");

      card.innerHTML = `
        <h3>${script.title}</h3>
        <p>${script.description || "بدون وصف"}</p>
        ${script.image ? `<img src="${script.image}" alt="Script Image">` : ""}
        <div class="info">
          <span>${keyStatus}</span>
          <span>👁️ ${script.views || 0}</span>
        </div>
        <button data-url="${rawUrl}" class="copy-btn">📋 نسخ السكربت</button>
      `;

      resultsDiv.appendChild(card);
    });

    // إضافة أحداث النسخ لكل زر بعد الإنشاء
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const url = decodeURIComponent(btn.getAttribute("data-url"));
        if (!url) {
          alert("❌ لا يوجد رابط للنسخ");
          return;
        }

        btn.textContent = "⏳ جاري النسخ...";
        try {
          const res = await fetch(`/api/raw?url=${encodeURIComponent(url)}`);
          const text = await res.text();

          if (!text) throw new Error("نص فارغ");

          await navigator.clipboard.writeText(text);
          btn.textContent = "✅ تم النسخ";
          setTimeout(() => (btn.textContent = "📋 نسخ السكربت"), 1500);
        } catch {
          btn.textContent = "❌ فشل النسخ";
          setTimeout(() => (btn.textContent = "📋 نسخ السكربت"), 1500);
        }
      });
    });

  } catch {
    resultsDiv.innerHTML = "<p>❌ حدث خطأ أثناء البحث</p>";
  }
}
