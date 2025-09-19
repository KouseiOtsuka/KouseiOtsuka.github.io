
/* =====================================================
 * Researcher Site - JS Enhancements
 * - Smooth scroll (internal links)
 * - Reveal on scroll (IntersectionObserver)
 * - Sticky header shadow
 * - Hero image tilt / parallax (desktop only)
 * - Button/link ripple effect
 * - Back-to-top floating button
 * - Hover lift effect via data attribute
 * ===================================================== */

(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Smooth Scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });

  /* ---------- Sticky Header Shadow ---------- */
  const header = document.querySelector(".navbar");
  const setShadow = () => {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("navbar-scrolled");
    else header.classList.remove("navbar-scrolled");
  };
  setShadow();
  window.addEventListener("scroll", setShadow, { passive: true });

  /* ---------- Reveal on Scroll ---------- */
  const revealTargets = Array.from(document.querySelectorAll(
    "h1, h2, h3, .card, .list-group-item, .hero .display-5, .hero-img, .publication-list li"
  ));
  revealTargets.forEach(el => el.classList.add("reveal"));
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-show");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -5%" });
    revealTargets.forEach(el => io.observe(el));
  } else {
    // Fallback: show immediately
    revealTargets.forEach(el => el.classList.add("reveal-show"));
  }

  /* ---------- Hero Tilt (parallax-ish) ---------- */
  const heroImg = document.querySelector(".hero-img");
  if (heroImg && window.matchMedia("(pointer:fine)").matches) {
    const wrapper = heroImg.closest(".text-center") || heroImg.parentElement;
    const onMove = (ev) => {
      const rect = heroImg.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width - 0.5;
      const y = (ev.clientY - rect.top) / rect.height - 0.5;
      heroImg.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateZ(0)`;
    };
    const reset = () => heroImg.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
    wrapper.addEventListener("mousemove", onMove);
    wrapper.addEventListener("mouseleave", reset);
  }

  /* ---------- Ripple Effect ---------- */
  const addRipple = (el) => {
    el.style.position = el.style.position || "relative";
    el.style.overflow = "hidden";
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const circle = document.createElement("span");
      circle.className = "ripple";
      circle.style.width = circle.style.height = d + "px";
      const x = e.clientX - rect.left - d/2;
      const y = e.clientY - rect.top - d/2;
      circle.style.left = x + "px";
      circle.style.top = y + "px";
      el.appendChild(circle);
      circle.addEventListener("animationend", () => circle.remove());
    });
  };
  document.querySelectorAll(".btn, .list-group-item-action").forEach(addRipple);

  /* ---------- Back-to-top Button ---------- */
  const topBtn = document.createElement("button");
  topBtn.className = "back-to-top";
  topBtn.setAttribute("aria-label", "ページ上部へ");
  topBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
  document.body.appendChild(topBtn);
  const showTopBtn = () => {
    if (window.scrollY > 500) topBtn.classList.add("show");
    else topBtn.classList.remove("show");
  };
  showTopBtn();
  window.addEventListener("scroll", showTopBtn, { passive: true });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" }));

  /* ---------- Hover lift (data-hover-lift) ---------- */
  document.querySelectorAll("[data-hover-lift]").forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translateY(-2px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;
    });
    el.addEventListener("mouseleave", () => el.style.transform = "translateY(0) rotateX(0) rotateY(0)");
  });
})();
