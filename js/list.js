async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function normalizePriority(x) {
  const p = Number(x);
  return Number.isFinite(p) ? p : 0;
}

function normalizeDateISO(x) {
  // expects YYYY-MM-DD; fallback = very old
  const s = typeof x === "string" ? x : "";
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

function sortByPriorityThenDateDesc(items) {
  return [...(items || [])].sort((a, b) => {
    const pa = normalizePriority(a.priority);
    const pb = normalizePriority(b.priority);
    if (pb !== pa) return pb - pa;

    const da = normalizeDateISO(a.date);
    const db = normalizeDateISO(b.date);
    return db - da;
  });
}

function el(tag, className = "", html = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

function hideIfEmpty(sectionId, hasData) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;
  if (!hasData) sec.classList.add("hidden");
  else sec.classList.remove("hidden");
}

/* ---------- cards (you can customize per page) ---------- */
function projectCard(p, opts = {}) {
  const showPriority = !!opts.showPriority;

  const card = el("div", "rounded-3xl border border-white/10 bg-white/5 overflow-hidden");

  if (p.image) {
    const img = el("img", "w-full h-40 object-cover");
    img.src = p.image;
    img.alt = p.name || "project";
    card.appendChild(img);
  }

  const body = el("div", "p-5");
  body.appendChild(el("h3", "font-semibold text-lg", p.name || "Untitled"));
  body.appendChild(el("p", "text-slate-300 mt-2 text-sm leading-relaxed", p.description || ""));

  const meta = el("div", "mt-3 flex flex-wrap gap-2 text-xs text-slate-300");
  if (showPriority) {
    meta.appendChild(
      el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", `Priority: ${normalizePriority(p.priority)}`)
    );
  }
  if (p.date) {
    meta.appendChild(el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", p.date));
  }
  if (meta.childNodes.length) body.appendChild(meta);

  const tags = el("div", "mt-3 flex flex-wrap gap-2");
  (p.tags || []).forEach(t => tags.appendChild(el("span", "text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10", t)));
  if (tags.childNodes.length) body.appendChild(tags);

  const actions = el("div", "mt-4 flex gap-3 text-sm");
  if (p.repo) {
    const a = el("a", "hover:underline", "Repo");
    a.href = p.repo; a.target = "_blank"; a.rel = "noreferrer";
    actions.appendChild(a);
  }
  if (p.demo) {
    const a = el("a", "hover:underline", "Demo");
    a.href = p.demo; a.target = "_blank"; a.rel = "noreferrer";
    actions.appendChild(a);
  }
  if (actions.childNodes.length) body.appendChild(actions);

  card.appendChild(body);
  return card;
}



function educationCard(e, opts = {}) {
  const showPriority = !!opts.showPriority;

  const card = el("div", "rounded-3xl border border-white/10 bg-white/5 p-5");

  const title = (e.degree || "").trim() || "Education";
  const sub = [e.school, e.location].filter(Boolean).join(" • ");
  const timeText = [e.date, e.endDate].filter(Boolean).join(" → ");

  card.appendChild(el("div", "font-semibold text-lg", title));
  if (sub) card.appendChild(el("div", "text-slate-300 text-sm mt-1", sub));

  const metaRow = el("div", "mt-3 flex flex-wrap gap-2 text-xs text-slate-300");

  // if (showPriority) {
  //   metaRow.appendChild(
  //     el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", `Priority: ${normalizePriority(e.priority)}`)
  //   );
  // }

  if (timeText) {
    metaRow.appendChild(
      el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", timeText)
    );
  }

  if (metaRow.childNodes.length) card.appendChild(metaRow);

  if (Array.isArray(e.details) && e.details.length) {
    const ul = el("ul", "mt-3 list-disc list-inside text-slate-300 text-sm space-y-1");
    e.details.forEach((d) => ul.appendChild(el("li", "", d)));
    card.appendChild(ul);
  }

  return card;
}



function experienceCard(x, opts = {}) {
  const showPriority = !!opts.showPriority;

  const card = el("div", "rounded-3xl border border-white/10 bg-white/5 p-5");

  const titleLeft = (x.role || "").trim() || "Experience";
  const titleRight = (x.company || "").trim();

  const top = el("div", "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2");
  top.appendChild(el("div", "font-semibold text-lg", titleLeft));
  if (titleRight) top.appendChild(el("div", "text-slate-200 text-sm sm:text-base", titleRight));
  card.appendChild(top);

  const sub = [x.type, x.location].filter(Boolean).join(" • ");
  if (sub) card.appendChild(el("div", "text-slate-300 text-sm mt-1", sub));

  const timeText = [x.date, x.endDate].filter(Boolean).join(" → ");
  const metaRow = el("div", "mt-3 flex flex-wrap gap-2 text-xs text-slate-300");

  // if (showPriority) {
  //   metaRow.appendChild(
  //     el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", `Priority: ${normalizePriority(x.priority)}`)
  //   );
  // }

  if (timeText) {
    metaRow.appendChild(
      el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", timeText)
    );
  }

  if (metaRow.childNodes.length) card.appendChild(metaRow);

  if (Array.isArray(x.details) && x.details.length) {
    const ul = el("ul", "mt-3 list-disc list-inside text-slate-300 text-sm space-y-1");
    x.details.forEach((d) => ul.appendChild(el("li", "", d)));
    card.appendChild(ul);
  }

  if (Array.isArray(x.links) && x.links.length) {
    const actions = el("div", "mt-4 flex flex-wrap gap-3 text-sm");
    x.links.forEach((l) => {
      const a = el("a", "hover:underline", l.label || "Link");
      a.href = l.url || "#";
      a.target = "_blank";
      a.rel = "noreferrer";
      actions.appendChild(a);
    });
    card.appendChild(actions);
  }

  return card;
}

function publicationCard(p, opts = {}) {
  const showPriority = !!opts.showPriority;

  const card = el("div", "rounded-3xl border border-white/10 bg-white/5 p-5");

  const title = (p.title || "").trim() || "Publication";
  card.appendChild(el("div", "font-semibold text-lg", title));

  const meta = [p.venue, p.year].filter(Boolean).join(" • ");
  if (meta) card.appendChild(el("div", "text-slate-300 text-sm mt-1", meta));

  if (p.authors) card.appendChild(el("div", "text-slate-300 text-sm mt-2", p.authors));

  const metaRow = el("div", "mt-3 flex flex-wrap gap-2 text-xs text-slate-300");

  // if (showPriority) {
  //   metaRow.appendChild(
  //     el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", `Priority: ${normalizePriority(p.priority)}`)
  //   );
  // }

  if (p.date) {
    metaRow.appendChild(
      el("span", "px-2 py-1 rounded-full bg-white/5 border border-white/10", p.date)
    );
  }

  if (metaRow.childNodes.length) card.appendChild(metaRow);

  if (p.notes) {
    card.appendChild(el("p", "text-slate-300 text-sm mt-3 leading-relaxed", p.notes));
  }

  const actions = el("div", "mt-4 flex flex-wrap gap-3 text-sm");
  let hasAction = false;

  if (p.paperUrl) {
    const a = el("a", "hover:underline", "Paper");
    a.href = p.paperUrl; a.target = "_blank"; a.rel = "noreferrer";
    actions.appendChild(a);
    hasAction = true;
  }

  if (p.codeUrl) {
    const a = el("a", "hover:underline", "Code");
    a.href = p.codeUrl; a.target = "_blank"; a.rel = "noreferrer";
    actions.appendChild(a);
    hasAction = true;
  }

  if (hasAction) card.appendChild(actions);

  return card;
}