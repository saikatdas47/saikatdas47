(async function () {
  const GRID_ID = "experienceGrid";
  const SECTION_ID = "experienceSection";
  const EMPTY_ID = "emptyExperience";

  function showEmpty(show) {
    const box = document.getElementById(EMPTY_ID);
    if (!box) return;
    box.classList.toggle("hidden", !show);
  }

  // mode: "newest" | "oldest"
  function sortByDate(items, mode) {
    const list = [...(items || [])];

    return list.sort((a, b) => {
      const dateA = normalizeDateISO(a.date);
      const dateB = normalizeDateISO(b.date);

      return mode === "oldest" ? dateA - dateB : dateB - dateA; // newest default
    });
  }

  try {
    const items = await loadJSON("data/experience.json");

    hideIfEmpty(SECTION_ID, Array.isArray(items) && items.length > 0);
    showEmpty(!items || items.length === 0);

    const grid = document.getElementById(GRID_ID);
    const sortMode = document.getElementById("sortMode");

    function paint() {
      if (!grid) return;

      const mode = sortMode ? sortMode.value : "newest";
      const sorted = sortByDate(items, mode);

      grid.innerHTML = "";
      sorted.forEach((x) => grid.appendChild(experienceCard(x)));
    }

    if (sortMode) sortMode.addEventListener("change", paint);
    paint();
  } catch (e) {
    console.error(e);
    showEmpty(true);
  }
})();