(async function () {
  const GRID_ID = "blogsGrid";
  const SECTION_ID = "blogsSection";
  const EMPTY_ID = "emptyBlogs";

  function showEmpty(show) {
    const box = document.getElementById(EMPTY_ID);
    if (!box) return;
    box.classList.toggle("hidden", !show);
  }

  function sortByDate(items, mode) {
    const list = [...(items || [])];

    return list.sort((a, b) => {
      const dateA = normalizeDateISO(a.date);
      const dateB = normalizeDateISO(b.date);
      return mode === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }

  function blogCard(x) {
    const wrap = document.createElement("div");
    wrap.className =
      "rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/7 transition";

    const img = document.createElement("img");
    img.src = x.image || "assets/blogImage/default.png";
    img.alt = x.title || "Blog image";
    img.className = "w-full h-40 object-cover";

    img.onerror = () => {
      img.onerror = null;
      img.src = "assets/blogImage/default.png";
    };

    const content = document.createElement("div");
    content.className = "p-4";

    const title = document.createElement("h3");
    title.className = "text-lg font-semibold";
    title.textContent = x.title || "Untitled";

    const meta = document.createElement("p");
    meta.className = "mt-1 text-xs text-slate-400";
    meta.textContent = x.date || "";

    const excerpt = document.createElement("p");
    excerpt.className = "mt-3 text-sm text-slate-300";
    excerpt.textContent = x.excerpt || "";

    const btnRow = document.createElement("div");
    btnRow.className = "mt-4";

    if (x.link) {
      const a = document.createElement("a");
      a.href = x.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className =
        "inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs hover:bg-white/15 transition";
      a.textContent = "Read More";

      btnRow.appendChild(a);
    }

    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(excerpt);
    if (btnRow.childNodes.length) content.appendChild(btnRow);

    wrap.appendChild(img);
    wrap.appendChild(content);

    return wrap;
  }

  try {
    const items = await loadJSON("data/blogs.json");

    hideIfEmpty(SECTION_ID, Array.isArray(items) && items.length > 0);
    showEmpty(!items || items.length === 0);

    const grid = document.getElementById(GRID_ID);
    const sortMode = document.getElementById("sortMode");

    function paint() {
      if (!grid) return;

      const mode = sortMode ? sortMode.value : "newest";
      const sorted = sortByDate(items, mode);

      grid.innerHTML = "";
      sorted.forEach((x) => grid.appendChild(blogCard(x)));
    }

    if (sortMode) sortMode.addEventListener("change", paint);
    paint();

  } catch (e) {
    console.error(e);
    showEmpty(true);
  }
})();