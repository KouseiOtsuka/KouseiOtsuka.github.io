/* ==================================================
   Minimal Fancy Interactions (no external libraries)
   - Reveal on scroll (.reveal-up)
   - Card tilt (elements with .js-tilt)
   - Subtle parallax (elements with [data-parallax])
   - Header shadow when scrolling
   ================================================== */
(() => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Header shadow on scroll
  const header = document.querySelector(
    "header.navbar, header.bg-gradient-primary, header.navbar-dark"
  );
  const toggleHeader = () => {
    if (!header) return;
    const scrolled = window.scrollY > 10;
    header.classList.toggle("shadow-sm", scrolled);
    header.style.transition = "box-shadow .2s ease";
  };
  window.addEventListener("scroll", toggleHeader, { passive: true });
  toggleHeader();

  if (prefersReduced) return; // Respect user preference

  // Reveal on scroll
  const revealTargets = Array.from(document.querySelectorAll(".reveal-up"));
  if (revealTargets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  // Tilt on hover for cards
  const tiltEls = Array.from(document.querySelectorAll(".js-tilt"));
  tiltEls.forEach((el) => {
    let rect;
    const max = 8; // deg
    const reset = () => {
      el.style.transform =
        "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
    };
    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.style.transition = "transform .12s ease";
      el.style.willChange = "transform";
    };
    const onMove = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * max;
      const ry = (x - 0.5) * max;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    };
    const onLeave = () => {
      el.style.transition = "transform .24s ease";
      reset();
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    reset();
  });

  // Parallax for hero image
  const parallaxEl = document.querySelector("[data-parallax]");
  if (parallaxEl) {
    const strength = parseFloat(parallaxEl.dataset.parallax) || 18;
    const onParallax = (e) => {
      const rect = parallaxEl.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      parallaxEl.style.transform = `translate(${x * strength}px, ${
        y * strength
      }px)`;
    };
    const onLeave = () => {
      parallaxEl.style.transform = "translate(0,0)";
    };
    parallaxEl.addEventListener("mousemove", onParallax);
    parallaxEl.addEventListener("mouseleave", onLeave);
  }
})();

// 現在のパスと各リンクのパスを比較して active を付与
(function () {
  const norm = (p) => {
    // 末尾 / は /index.html と同一視
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
})();

// ドラッグで横スクロールできるようにする（pointer events でマウス/タッチ共通）
(function () {
  document.querySelectorAll(".photo-rail").forEach(setupDragScroll);

  function setupDragScroll(el) {
    // 横スクロール対象にドラッグ用クラスを付与
    el.classList.add("drag-scroll");

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let pid = null;

    el.addEventListener("pointerdown", (e) => {
      isDown = true;
      pid = e.pointerId;
      el.setPointerCapture?.(pid);
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.classList.add("is-dragging");
    });

    el.addEventListener(
      "pointermove",
      (e) => {
        if (!isDown) return;
        // ドラッグ量に応じて横スクロール
        const dx = e.clientX - startX;
        el.scrollLeft = startScrollLeft - dx;
        // 画像のデフォルトドラッグ動作を抑止（指/マウスどちらでも快適に）
        e.preventDefault();
      },
      { passive: false }
    );

    const end = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("is-dragging");
      try {
        el.releasePointerCapture?.(pid);
      } catch (_) {}
      pid = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointerleave", end);
    el.addEventListener("pointercancel", end);
  }
})();
