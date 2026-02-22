(async function () {
    const GRID_ID = "licencesGrid";
    const SECTION_ID = "licencesSection";
    const EMPTY_ID = "emptyLicences";

    function showEmpty(show) {
        const box = document.getElementById(EMPTY_ID);
        if (!box) return;
        box.classList.toggle("hidden", !show);
    }

    // Sort: newest / oldest
    function sortByDate(items, mode) {
        const list = [...(items || [])];

        return list.sort((a, b) => {
            const dateA = normalizeDateISO(a.issueDate || a.date);
            const dateB = normalizeDateISO(b.issueDate || b.date);
            return mode === "oldest" ? dateA - dateB : dateB - dateA;
        });
    }

    function licenceCard(x) {
        const wrap = document.createElement("div");
        wrap.className =
            "rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/7 transition max-w-3xl";

        // 0.4 / 0.6 split -> 2fr / 3fr
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-[2fr_3fr] gap-6 items-start";

        // LEFT: image fills full 40% column width
        const logoBox = document.createElement("div");
        logoBox.className =
            "w-full rounded-2xl border border-white/10 bg-black/20 overflow-hidden";

        const img = document.createElement("img");
        img.src = x.image || "assets/licences/default.png";
        img.alt = `${x.issuer || "Certificate"} logo`;
        img.className = "w-full h-auto object-contain";

        img.onerror = () => {
            img.onerror = null;
            img.src = "assets/licences/default.png";
        };

        logoBox.appendChild(img);

        // RIGHT: content takes 60%
        const content = document.createElement("div");
        content.className = "min-w-0";

        const title = document.createElement("h3");
        title.className = "text-xs md:text-2xl font-semibold leading-snug";
        title.textContent = x.title || "Untitled";

        const meta = document.createElement("p");
        meta.className = "mt-2 text-slate-300";
        meta.textContent =
            `${x.issuer || ""}${x.issuer && x.issueDate ? " • " : ""}${x.issueDate || ""}`;

        content.appendChild(title);
        content.appendChild(meta);

        if (x.description) {
            const desc = document.createElement("p");
            desc.className = "mt-4 text-slate-300";
            desc.textContent = x.description;
            content.appendChild(desc);
        }

        const row = document.createElement("div");
        row.className = "mt-5 flex flex-wrap items-center gap-4 text-sm";

        if (x.credentialId) {
            const cid = document.createElement("span");
            cid.className =
                "rounded-full border border-white/10 bg-black/20 px-4 py-2 text-slate-200";
            cid.textContent = `Credential ID: ${x.credentialId}`;
            row.appendChild(cid);
        }

        if (x.credentialUrl) {
            const a = document.createElement("a");
            a.href = x.credentialUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className =
                "rounded-full border border-white/10 bg-white/10 px-4 py-2 hover:bg-white/15 transition";
            a.textContent = "Show credential";
            row.appendChild(a);
        }

        if (row.childNodes.length) content.appendChild(row);

        grid.appendChild(logoBox);
        grid.appendChild(content);
        wrap.appendChild(grid);

        return wrap;
    }


    try {
        const items = await loadJSON("data/licences.json");

        hideIfEmpty(SECTION_ID, Array.isArray(items) && items.length > 0);
        showEmpty(!items || items.length === 0);

        const grid = document.getElementById(GRID_ID);
        const sortMode = document.getElementById("sortMode");

        function paint() {
            if (!grid) return;

            const mode = sortMode ? sortMode.value : "newest";
            const sorted = sortByDate(items, mode);

            grid.innerHTML = "";
            sorted.forEach((x) => grid.appendChild(licenceCard(x)));
        }

        if (sortMode) sortMode.addEventListener("change", paint);
        paint();
    } catch (e) {
        console.error(e);
        showEmpty(true);
    }
})();