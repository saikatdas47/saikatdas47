(function () {
  const navHTML = `
  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-white/10">
    <div class="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      
      <!-- Logo -->
      <a href="index.html" class="font-semibold tracking-wide text-white">
        Saikat Das
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex gap-6 text-sm text-slate-300">
        <a href="index.html" class="hover:text-white transition">Home</a>
        <a href="projects.html" class="hover:text-white transition">Projects</a>
        <a href="education.html" class="hover:text-white transition">Education</a>
        <a href="experience.html" class="hover:text-white transition">Experience</a>
        <a href="publications.html" class="hover:text-white transition">Publications</a>
        <a href="licences.html" class="hover:text-white transition">Certificates</a>
        <a href="blogs.html" class="hover:text-white transition">Blogs</a>
      </nav>

      <!-- Mobile Button -->
      <button id="mobileMenuBtn"
        class="md:hidden text-slate-300 hover:text-white focus:outline-none">
        ☰
      </button>

    </div>

    <!-- Mobile Menu -->
    <div id="mobileMenu"
      class="hidden md:hidden border-t border-white/10 bg-slate-950 px-4 py-4 space-y-4 text-sm text-slate-300">
        <a href="index.html" class="block hover:text-white transition">Home</a>
        <a href="projects.html" class="block hover:text-white transition">Projects</a>
        <a href="education.html" class="block hover:text-white transition">Education</a>
        <a href="experience.html" class="block hover:text-white transition">Experience</a>
        <a href="publications.html" class="block hover:text-white transition">Publications</a>
        <a href="licences.html" class="block hover:text-white transition">Certificates</a>
        <a href="blogs.html" class="block hover:text-white transition">Blogs</a>
    </div>
  </header>
  `;

  const mount = document.getElementById("navMount");
  if (mount) mount.innerHTML = navHTML;

  // Toggle Mobile Menu
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");

  if (btn && menu) {
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }
})();