// ---------- Data + rendering ----------
let episodes = [];
let specials = [];
let currentTab = "episodes";
let currentSort = "episode";
let searchTerm = "";

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function renderEpisodes() {
  const tbody = document.getElementById("tbody-episodes");
  const empty = document.getElementById("empty-episodes");
  let rows = episodes.filter(e => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return String(e.episode).includes(term)
      || (e.year && String(e.year).includes(term))
      || (e.laureates && e.laureates.toLowerCase().includes(term));
  });

  rows.sort((a, b) => {
    if (currentSort === "year") {
      const ay = a.year ?? 9999, by = b.year ?? 9999;
      return ay - by;
    }
    return a.episode - b.episode;
  });

  tbody.innerHTML = "";
  rows.forEach(e => {
    const tr = document.createElement("tr");
    const yearCell = e.year
      ? `<span class="year-val">${e.year}</span>`
      : e.label
        ? `<span class="year-val pending">${e.label}</span>`
        : `<span class="year-val pending">TBA</span>`;
    const watchCell = e.link
      ? `<a class="watch-link" href="${e.link}" target="_blank" rel="noopener">Watch &rarr;</a>`
      : `<span class="watch-pending">link coming soon</span>`;
    tr.innerHTML = `
      <td class="ep-num">#${e.episode}</td>
      <td>${yearCell}</td>
      <td class="laureate-val">${e.laureates ? e.laureates : ""}</td>
      <td class="date-val">${fmtDate(e.date)}</td>
      <td>${watchCell}</td>
    `;
    tbody.appendChild(tr);
  });

  empty.hidden = rows.length !== 0;
}

function renderSpecials() {
  const tbody = document.getElementById("tbody-specials");
  const empty = document.getElementById("empty-specials");
  let rows = specials.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return String(s.special).includes(term) || (s.topic && s.topic.toLowerCase().includes(term));
  });

  rows.sort((a, b) => a.special - b.special);

  tbody.innerHTML = "";
  rows.forEach(s => {
    const tr = document.createElement("tr");
    const topicCell = s.topic
      ? `<span class="topic-val">${s.topic}</span>`
      : `<span class="topic-val pending">TBA</span>`;
    const watchCell = s.link
      ? `<a class="watch-link" href="${s.link}" target="_blank" rel="noopener">Watch &rarr;</a>`
      : `<span class="watch-pending">link coming soon</span>`;
    tr.innerHTML = `
      <td class="ep-num">#${s.special}</td>
      <td>${topicCell}</td>
      <td class="date-val">${fmtDate(s.date)}</td>
      <td>${watchCell}</td>
    `;
    tbody.appendChild(tr);
  });

  empty.hidden = rows.length !== 0;
}

function renderCurrent() {
  if (currentTab === "episodes") renderEpisodes();
  else renderSpecials();
}

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    currentTab = btn.dataset.tab;

    document.getElementById("panel-episodes").hidden = currentTab !== "episodes";
    document.getElementById("panel-specials").hidden = currentTab !== "specials";
    document.getElementById("sort-wrap").style.display = currentTab === "episodes" ? "flex" : "none";
    renderCurrent();
  });
});

// ---------- Sort ----------
document.querySelectorAll(".sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    renderCurrent();
  });
});

// ---------- Search ----------
document.getElementById("search").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  renderCurrent();
});

// ---------- Load data ----------
Promise.all([
  fetch("episodes.json").then(r => r.json()),
  fetch("specials.json").then(r => r.json())
]).then(([eps, specs]) => {
  episodes = eps;
  specials = specs;
  document.getElementById("count-episodes").textContent = episodes.length;
  document.getElementById("count-specials").textContent = specials.length;
  renderCurrent();
}).catch(err => {
  console.error("Failed to load archive data:", err);
});
