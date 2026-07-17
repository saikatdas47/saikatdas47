(function () {
  const LINKS = [
    { href: "index.html", label: "Home", ico: "🏠" },
    { href: "projects.html", label: "Projects", ico: "📁" },
    { href: "education.html", label: "Education", ico: "🎓" },
    { href: "experience.html", label: "Experience", ico: "💼" },
    { href: "publications.html", label: "Publications", ico: "📄" },
    { href: "licences.html", label: "Certificates", ico: "🏅" },
    { href: "blogs.html", label: "Blogs", ico: "✍️" },
    { href: "cv.html", label: "CV", ico: "📜" },
  ];

  const page = window.location.pathname.split("/").pop() || "index.html";
  const active = LINKS.find((l) => l.href === page) || LINKS[0];

  /* ---------- Left task pane ---------- */
  const navLinks = LINKS.map(
    (l) =>
      `<a class="xp-link ${l.href === page ? "active" : ""}" href="${l.href}">
         <span class="ico">${l.ico}</span><span>${l.label}</span>
       </a>`
  ).join("");

  const tasksHTML = `
    <div class="xp-group">
      <div class="xp-group-head"><span>Portfolio Tasks</span><span class="chev">▾</span></div>
      <div class="xp-group-body">${navLinks}</div>
    </div>

    <div class="xp-group">
      <div class="xp-group-head"><span>Other Places</span><span class="chev">▾</span></div>
      <div class="xp-group-body">
        <a class="xp-link" href="cv.html"><span class="ico">📄</span><span>My Documents (CV)</span></a>
        <a class="xp-link" href="Saikat Das CV.pdf" download><span class="ico">💾</span><span>Download CV</span></a>
        <a class="xp-link" href="index.html#homeContact"><span class="ico">✉️</span><span>Contact</span></a>
      </div>
    </div>

    <div class="xp-group">
      <div class="xp-group-head"><span>Details</span><span class="chev">▾</span></div>
      <div class="xp-group-body">
        <p class="xp-note-mini"><strong>Saikat Das</strong><br>Portfolio<br>Windows XP Edition</p>
      </div>
    </div>`;

  const mount = document.getElementById("navMount");
  if (mount) mount.innerHTML = tasksHTML;

  /* ---------- Taskbar + Start menu ---------- */
  const startMenuLinks = LINKS.map(
    (l) => `<a href="${l.href}"><span>${l.ico}</span><span>${l.label}</span></a>`
  ).join("");

  const bar = document.createElement("nav");
  bar.className = "xp-taskbar";
  bar.setAttribute("aria-label", "Taskbar");
  bar.innerHTML = `
    <button class="xp-start" id="xpStart" aria-haspopup="true" aria-expanded="false">
      <span class="xp-flag"></span>start
    </button>
    <div class="xp-tasklist">
      <a class="xp-taskbtn active" href="${active.href}"><span>${active.ico}</span><span>${active.label} — Saikat Das</span></a>
    </div>
    <div class="xp-tray"><span id="xpClock">--:--</span></div>`;
  document.body.appendChild(bar);

  const menu = document.createElement("div");
  menu.className = "xp-startmenu";
  menu.id = "xpStartMenu";
  menu.innerHTML = `
    <div class="xp-startmenu-head">
      <span class="avatar">🙂</span><span>Saikat Das</span>
    </div>
    <div class="xp-startmenu-body">${startMenuLinks}</div>
    <div class="xp-startmenu-foot">
      <a href="Saikat Das CV.pdf" download style="color:#fff;text-decoration:none;">💾 Download CV</a>
    </div>`;
  document.body.appendChild(menu);

  const startBtn = document.getElementById("xpStart");
  function toggleStart(force) {
    const open = force !== undefined ? force : !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    startBtn.setAttribute("aria-expanded", String(open));
  }
  startBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleStart(); });
  menu.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => toggleStart(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleStart(false); });

  /* ---------- Clock ---------- */
  const clock = document.getElementById("xpClock");
  function tick() {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  tick();
  setInterval(tick, 15000);

  /* ---------- Fake close button → XP dialog ---------- */
  function xpDialog({ title, icon, message, buttons }) {
    const overlay = document.createElement("div");
    overlay.className = "xp-overlay";
    overlay.innerHTML = `
      <div class="xp-dialog" role="dialog" aria-modal="true" aria-label="${title}">
        <header class="xp-titlebar">
          <span class="xp-title"><span class="xp-winicon">${icon}</span> ${title}</span>
          <span class="xp-controls"><button class="xp-cb xp-close" data-x aria-label="Close">✕</button></span>
        </header>
        <div class="xp-dialog-body">
          <div class="xp-dialog-icon">${icon}</div>
          <div class="xp-dialog-msg">${message}</div>
        </div>
        <div class="xp-dialog-buttons"></div>
      </div>`;

    function close() {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    const row = overlay.querySelector(".xp-dialog-buttons");
    buttons.forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "xp-button" + (b.primary ? " xp-primary" : "");
      btn.textContent = b.label;
      btn.addEventListener("click", () => { close(); if (b.action) b.action(); });
      row.appendChild(btn);
      if (b.primary) setTimeout(() => btn.focus(), 0);
    });

    overlay.querySelector("[data-x]").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    return close;
  }

  const SARCASM = [
    {
      icon: "✋", title: "Really?",
      msg: "You clicked <b>Yes</b>? On <i>my</i> window? After everything we rendered together on this page?",
      stay: "You're right, I'll stay", go: "Close anyway",
    },
    {
      icon: "😢", title: "Ouch.",
      msg: "Rude. I hand-built an entire Windows XP theme for you — the taskbar, the little clock, the green hill — and <b>this</b> is the thanks I get.",
      stay: "Ugh, fine, I'll stay", go: "Still closing",
    },
    {
      icon: "🎻", title: "Please.",
      msg: "<i>(a single violin begins to play)</i><br>Fine. But we both know this is a static HTML page. I have nowhere to go. The window will still be here. So will I.",
      stay: "…alright, I'll stay", go: "Close",
    },
    {
      icon: "🪟", title: "Nice try.",
      msg: "Plot twist: a fake button can't actually close a real browser tab, champ. But <b>10/10</b> for persistence. Genuinely impressed.",
      end: true,
    },
  ];

  function showStep(i) {
    const s = SARCASM[i];
    if (s.end) {
      xpDialog({
        icon: s.icon, title: s.title, message: s.msg,
        buttons: [{ label: "Okay, you win", primary: true }],
      });
      return;
    }
    xpDialog({
      icon: s.icon, title: s.title, message: s.msg,
      buttons: [
        { label: s.go, action: () => showStep(i + 1) },
        { label: s.stay, primary: true },
      ],
    });
  }

  function askClose() {
    xpDialog({
      icon: "❓", title: "Close Window",
      message: "Are you sure you want to close this window?",
      buttons: [
        { label: "Yes", action: () => showStep(0) },
        { label: "No", primary: true },
      ],
    });
  }

  document.querySelectorAll(".xp-window .xp-close").forEach((btn) => {
    btn.addEventListener("click", askClose);
  });

  /* Support legacy footer mount if present (no-op in XP shell) */
  const footer = document.getElementById("siteFooter");
  if (footer) footer.remove();
})();
