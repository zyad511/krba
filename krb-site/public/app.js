async function search() {
  const query = document.getElementById("search").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>جاري البحث...</p>";

  if (!query) {
    resultsDiv.innerHTML = "<p>❌ اكتب كلمة للبحث</p>";
    return;
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.length) {
      resultsDiv.innerHTML = "<p>❌ لم يتم العثور على نتائج</p>";
      return;
    }

    resultsDiv.innerHTML = "";

    data.forEach(script => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${script.title}</h3>
        <p>${script.description || ""}</p>
        <img src="${script.image || ''}" alt="${script.title}">
        <br>
        <a href="${script.rawScript}" target="_blank">تحميل السكربت</a>
      `;
      resultsDiv.appendChild(div);
    });
  } catch (err) {
    resultsDiv.innerHTML = "<p>❌ حدث خطأ أثناء البحث</p>";
  }
}
