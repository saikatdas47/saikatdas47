(async function () {
  function safeText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value ?? "";
  }

  function renderLinks(links) {
    const wrap = document.getElementById("links");
    if (!wrap) return;
    wrap.innerHTML = "";

    (links || []).forEach((l) => {
      const a = document.createElement("a");
      a.className =
        "px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm";
      a.href = l.url || "#";
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = l.label || "Link";
      wrap.appendChild(a);
    });
  }

  function renderSkills(skills) {
    const wrap = document.getElementById("skillsList");
    if (!wrap) return;
    wrap.innerHTML = "";

    (skills || []).forEach((s) => {
      const chip = document.createElement("span");
      chip.className =
        "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-200";
      chip.textContent = s;
      wrap.appendChild(chip);
    });
  }

  function setProfileImage(src) {
    const img = document.getElementById("profileImage");
    if (!img) return;
    if (src) img.src = src;
  }

  // ✅ Contact renderer (inside same file)
  function renderContact(contact) {
    const box = document.getElementById("homeContactBox");
    const section = document.getElementById("homeContact");

    // if section not in HTML, just skip
    if (!box || !section) return;

    box.innerHTML = "";

    const entries = [
      { label: "Phone", value: contact?.phone, href: contact?.phone ? `tel:${contact.phone}` : null },
      { label: "Email", value: contact?.email, href: contact?.email ? `mailto:${contact.email}` : null },
      { label: "Facebook", value: contact?.facebook, href: contact?.facebook || null },
      { label: "Instagram", value: contact?.instagram, href: contact?.instagram || null },
      { label: "YouTube", value: contact?.youtube, href: contact?.youtube || null }
    ].filter((x) => x.value);

    // hide whole contact section if empty
    hideIfEmpty("homeContact", entries.length > 0);

    entries.forEach((item) => {
      const row = document.createElement("div");
      row.className = "text-sm";

      row.innerHTML = `
        <span class="text-slate-400">${item.label}:</span>
        <a href="${item.href || "#"}"
           ${item.href ? `target="_blank" rel="noreferrer"` : ""}
           class="text-white hover:underline ml-2 break-all">
          ${item.value}
        </a>
      `;

      box.appendChild(row);
    });
  }

  // Safe loader for list sections
  async function loadArrayOrEmpty(path) {
    try {
      const data = await loadJSON(path); // from list.js
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("Home section load failed:", path, e);
      return [];
    }
  }

  async function renderTop3Section({
    jsonPath,
    sectionId,
    gridId,
    cardFn,
    sortFn = sortByPriorityThenDateDesc,
    limit = 3
  }) {
    const items = await loadArrayOrEmpty(jsonPath);
    const top = sortFn(items).slice(0, limit);

    hideIfEmpty(sectionId, top.length > 0);

    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = "";
    top.forEach((x) => grid.appendChild(cardFn(x)));
  }

  function showHomeError(err) {
    console.error(err);

    const isFileProtocol = window.location.protocol === "file:";
    let msg = "Home load failed.\n\n";

    if (isFileProtocol) {
      msg +=
        "Reason: You opened with file:// (double click). fetch() cannot load JSON.\n\n" +
        "Fix:\npython -m http.server 8000\nOpen: http://localhost:8000\n\n";
    }

    msg += `Error: ${err?.message || err}`;
    alert(msg);
  }

  try {
    // -------- Profile (home.json) --------
    const home = await loadJSON("data/home.json");

    safeText("name", home.name);
    safeText("title", home.title);
    safeText("location", home.location);

    safeText("about", home.about);
    safeText("aboutPreview", home.about);

    renderLinks(home.links);
    renderSkills(home.skills);
    setProfileImage(home.profileImage);

    // ✅ render contact from home.json
    renderContact(home.contact);

    const ft = document.getElementById("footerText");
    if (ft) ft.textContent = `© ${new Date().getFullYear()} ${home.name || ""}`;

    // -------- Top-3 sections --------
    await renderTop3Section({
      jsonPath: "data/projects.json",
      sectionId: "homeProjects",
      gridId: "homeProjectsGrid",
      cardFn: projectCard
    });

    await renderTop3Section({
      jsonPath: "data/education.json",
      sectionId: "homeEducation",
      gridId: "homeEducationGrid",
      cardFn: educationCard
    });

    await renderTop3Section({
      jsonPath: "data/experience.json",
      sectionId: "homeExperience",
      gridId: "homeExperienceGrid",
      cardFn: experienceCard
    });

    await renderTop3Section({
      jsonPath: "data/publications.json",
      sectionId: "homePublications",
      gridId: "homePublicationsGrid",
      cardFn: publicationCard
    });
  } catch (err) {
    showHomeError(err);
  }
})();