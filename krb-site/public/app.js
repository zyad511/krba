async function searchScripts() {
  const input = document.getElementById("searchInput");
  const resultsDiv = document.getElementById("results");

  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "<p>🔍 Searching...</p>";

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    resultsDiv.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p>❌ No scripts found</p>";
      return;
    }

    data.results.forEach(script => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${script.title}</h3>
        <p>${script.description || "No description"}</p>
        ${script.image ? `<img src="${script.image}" />` : ""}
        <a href="${script.rawScript}" target="_blank">📜 View Script</a>
      `;

      resultsDiv.appendChild(card);
    });

  } catch (e) {
    resultsDiv.innerHTML = "<p>⚠️ Error fetching scripts</p>";
  }
}
