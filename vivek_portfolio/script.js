const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
const progressBar = document.querySelector(".scroll-progress span");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Accessible mobile navigation
menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

// Reveal sections as they enter the viewport, with a subtle stagger.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 75}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// Scroll progress indicator and active section navigation.
const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const trackedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
let scrollTicking = false;
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = `${progress}%`;

  let current = trackedSections[0]?.id;
  trackedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 150) current = section.id;
  });
  sectionLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${current}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollTicking = false;
}
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

// Gentle pointer spotlight on desktop.
if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
  window.addEventListener("pointermove", (event) => {
    document.body.classList.add("pointer-active");
    document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
  }, { passive: true });
}

// Lightweight 3D tilt for project and skill cards; disabled on touch/reduced-motion.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
  document.querySelectorAll(".project-card, .skill-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 5;
      const rotateX = (0.5 - y) * 5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  // Very restrained portrait parallax.
  const portrait = document.querySelector(".photo-frame");
  const heroVisual = document.querySelector(".hero-visual");
  heroVisual?.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    if (portrait) portrait.style.transform = `translate3d(${dx * 8}px, ${dy * 8}px, 0)`;
  });
  heroVisual?.addEventListener("pointerleave", () => {
    if (portrait) portrait.style.transform = "";
  });
}
