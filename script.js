// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
// Toggle Mobile Menu
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');
const mobileMenuPanel = mobileMenu.querySelector('div');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.remove('hidden');
  setTimeout(() => {
    mobileMenuPanel.classList.remove('translate-x-full');
  }, 10); // Small delay to allow the hidden class to be removed first
});

closeMenu.addEventListener('click', () => {
  mobileMenuPanel.classList.add('translate-x-full');
  setTimeout(() => {
    mobileMenu.classList.add('hidden');
  }, 300); // Match the duration of the transition
});