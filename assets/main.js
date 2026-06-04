(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Active nav link ──────────────────────────────────────────
  const norm = (p) => {
    const u = new URL(p, location.href).pathname;
    return u.endsWith("/") ? u + "index.html" : u;
  };
  const current = norm(location.pathname);
  document.querySelectorAll(".navbar .nav-link").forEach((a) => {
    const target = norm(a.getAttribute("href") || "");
    if (target === current) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  // ── Header shadow on scroll ──────────────────────────────────
  const header = document.querySelector(".navbar");
  const setShadow = () => {
    if (!header) return;
    header.classList.toggle("navbar-scrolled", window.scrollY > 24);
  };
  setShadow();
  window.addEventListener("scroll", setShadow, { passive: true });

  // ── Smooth scroll (internal links) ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
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

  if (prefersReduced) {
    document.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // ── Reveal on scroll (.reveal-up → .is-visible) ──────────────
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5%" }
    );
    document.querySelectorAll(".reveal-up").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
  }

  // ── JS-tilt (mouse + touch) ───────────────────────────────────
  document.querySelectorAll(".js-tilt").forEach((el) => {
    const max = parseFloat(el.getAttribute("data-tilt-max") || "6");
    const scale = parseFloat(el.getAttribute("data-tilt-scale") || "1");
    let rect = null;

    const move = (clientX, clientY) => {
      rect = rect || el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = (-(clientY - cy) / rect.height * max).toFixed(2);
      const ry = ((clientX - cx) / rect.width * max).toFixed(2);
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    };

    el.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    el.addEventListener("mouseleave", () => { el.style.transform = ""; rect = null; });
    el.addEventListener("touchstart", (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    el.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    el.addEventListener("touchend", () => { el.style.transform = ""; rect = null; });
  });

  // ── Parallax for [data-parallax] ─────────────────────────────
  const parallaxEl = document.querySelector("[data-parallax]");
  if (parallaxEl) {
    const strength = parseFloat(parallaxEl.dataset.parallax) || 18;
    parallaxEl.addEventListener("mousemove", (e) => {
      const rect = parallaxEl.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      parallaxEl.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    parallaxEl.addEventListener("mouseleave", () => {
      parallaxEl.style.transform = "translate(0,0)";
    });
  }

  // ── Ripple effect ─────────────────────────────────────────────
  document.querySelectorAll(".btn, .list-group-item-action").forEach((el) => {
    el.style.position = el.style.position || "relative";
    el.style.overflow = "hidden";
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const circle = document.createElement("span");
      circle.className = "ripple";
      circle.style.width = circle.style.height = d + "px";
      circle.style.left = e.clientX - rect.left - d / 2 + "px";
      circle.style.top = e.clientY - rect.top - d / 2 + "px";
      el.appendChild(circle);
      circle.addEventListener("animationend", () => circle.remove());
    });
  });

  // ── Back-to-top button ────────────────────────────────────────
  const topBtn = document.createElement("button");
  topBtn.className = "back-to-top";
  topBtn.setAttribute("aria-label", "ページ上部へ");
  topBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
  document.body.appendChild(topBtn);
  const showTopBtn = () => topBtn.classList.toggle("show", window.scrollY > 500);
  showTopBtn();
  window.addEventListener("scroll", showTopBtn, { passive: true });
  topBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
  );

  // ── Hover lift (data-hover-lift) ──────────────────────────────
  document.querySelectorAll("[data-hover-lift]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translateY(-2px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = "translateY(0) rotateX(0) rotateY(0)"));
  });

  // ── Gallery navigation (#galPrev / #galNext) ──────────────────
  const gallery = document.getElementById("gallery");
  if (gallery) {
    const gap = 12;
    const item = gallery.querySelector(".gallery-item");
    const step = item ? item.getBoundingClientRect().width + gap : gallery.clientWidth * 0.8;
    document.getElementById("galPrev")?.addEventListener("click", () =>
      gallery.scrollBy({ left: -step, behavior: "smooth" })
    );
    document.getElementById("galNext")?.addEventListener("click", () =>
      gallery.scrollBy({ left: step, behavior: "smooth" })
    );
  }

  // ── Drag scroll for .photo-rail ───────────────────────────────
  document.querySelectorAll(".photo-rail").forEach((el) => {
    el.classList.add("drag-scroll");
    let isDown = false, startX = 0, startScrollLeft = 0, pid = null;

    el.addEventListener("pointerdown", (e) => {
      isDown = true;
      pid = e.pointerId;
      el.setPointerCapture?.(pid);
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.classList.add("is-dragging");
    });

    el.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      el.scrollLeft = startScrollLeft - (e.clientX - startX);
      e.preventDefault();
    }, { passive: false });

    const end = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("is-dragging");
      try { el.releasePointerCapture?.(pid); } catch (_) {}
      pid = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointerleave", end);
    el.addEventListener("pointercancel", end);
  });

})();
