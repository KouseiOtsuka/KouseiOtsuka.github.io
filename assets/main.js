(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFineMouse   = window.matchMedia("(pointer:fine)").matches;

  // ── Scroll progress bar ───────────────────────────────────────
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.prepend(progressBar);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  // ── Cursor spotlight ──────────────────────────────────────────
  if (isFineMouse && !prefersReduced) {
    const spotlight = document.createElement("div");
    spotlight.className = "cursor-spotlight";
    document.body.insertBefore(spotlight, document.body.firstChild);
    document.addEventListener("mousemove", (e) => {
      spotlight.style.setProperty("--sx", `${e.clientX}px`);
      spotlight.style.setProperty("--sy", `${e.clientY}px`);
    }, { passive: true });
  }

  // ── Active nav link ───────────────────────────────────────────
  const norm = (p) => {
    const u = new URL(p, location.href).pathname;
    return u.endsWith("/") ? u + "index.html" : u;
  };
  const current = norm(location.pathname);
  document.querySelectorAll(".navbar .nav-link").forEach((a) => {
    if (norm(a.getAttribute("href") || "") === current) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  // ── Header shadow on scroll ───────────────────────────────────
  const header = document.querySelector(".navbar");
  const setShadow = () => header?.classList.toggle("navbar-scrolled", window.scrollY > 24);
  setShadow();
  window.addEventListener("scroll", setShadow, { passive: true });

  // ── Page transition (fade out on navigate) ────────────────────
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#") || href.startsWith("http") ||
        href.startsWith("mailto") || a.target === "_blank" || prefersReduced) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(() => { window.location.href = href; }, 250);
    });
  });

  // ── Smooth scroll (internal links) ────────────────────────────
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
    document.querySelectorAll(".reveal-up, .stagger-children").forEach((el) =>
      el.classList.add("is-visible")
    );
    return;
  }

  // ── Reveal on scroll (.reveal-up) ────────────────────────────
  if ("IntersectionObserver" in window) {
    const revealIo = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5%" }
    );
    document.querySelectorAll(".reveal-up").forEach((el) => revealIo.observe(el));
  } else {
    document.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
  }

  // ── Stagger animation (.stagger-children) ────────────────────
  document.querySelectorAll(".stagger-children").forEach((parent) => {
    Array.from(parent.children).forEach((child, i) =>
      child.style.setProperty("--stagger-i", `${i * 75}ms`)
    );
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry], obs) => {
          if (entry.isIntersecting) { parent.classList.add("is-visible"); obs.disconnect(); }
        },
        { threshold: 0.08 }
      );
      io.observe(parent);
    } else {
      parent.classList.add("is-visible");
    }
  });

  // ── Typing animation ──────────────────────────────────────────
  const typedEl = document.querySelector(".typed-text");
  if (typedEl) {
    const cursor = document.querySelector(".typed-cursor");
    const phrases = [
      "XR空間の聴覚刺激攻撃を研究",
      "VR音響セキュリティの実証実験",
      "XR攻撃プリミティブの体系的分析",
      "没入型環境のユーザブルセキュリティ",
    ];
    let pi = 0, ci = 0, del = false;
    const tick = () => {
      typedEl.textContent = phrases[pi].slice(0, del ? --ci : ++ci);
      if (!del && ci === phrases[pi].length) {
        del = true;
        return setTimeout(tick, 2200);
      }
      if (del && ci === 0) {
        del = false;
        pi = (pi + 1) % phrases.length;
        return setTimeout(tick, 400);
      }
      setTimeout(tick, del ? 35 : 72);
    };
    setTimeout(tick, 900);
    if (cursor) {
      setInterval(() => cursor.classList.toggle("typed-cursor--off"), 530);
    }
  }

  // ── Magnetic buttons ──────────────────────────────────────────
  if (isFineMouse) {
    document.querySelectorAll(".btn-gradient, .btn-magnetic").forEach((btn) => {
      btn.style.transition = "transform 0.2s ease, opacity 0.15s ease, box-shadow 0.15s ease";
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * 0.22;
        const y = (e.clientY - r.top  - r.height / 2) * 0.22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }

  // ── JS-tilt (mouse + touch) ───────────────────────────────────
  document.querySelectorAll(".js-tilt").forEach((el) => {
    const max   = parseFloat(el.getAttribute("data-tilt-max")   || "6");
    const scale = parseFloat(el.getAttribute("data-tilt-scale") || "1");
    let rect = null;
    const move = (cx, cy) => {
      rect = rect || el.getBoundingClientRect();
      const rx = (-(cy - (rect.top  + rect.height / 2)) / rect.height * max).toFixed(2);
      const ry = ( (cx - (rect.left + rect.width  / 2)) / rect.width  * max).toFixed(2);
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    };
    el.addEventListener("mousemove",  (e) => move(e.clientX, e.clientY));
    el.addEventListener("mouseleave", () => { el.style.transform = ""; rect = null; });
    el.addEventListener("touchstart", (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    el.addEventListener("touchmove",  (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    el.addEventListener("touchend",   () => { el.style.transform = ""; rect = null; });
  });

  // ── Parallax for [data-parallax] ─────────────────────────────
  const parallaxEl = document.querySelector("[data-parallax]");
  if (parallaxEl && isFineMouse) {
    const strength = parseFloat(parallaxEl.dataset.parallax) || 18;
    parallaxEl.addEventListener("mousemove", (e) => {
      const rect = parallaxEl.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width  / 2)) / rect.width;
      const y = (e.clientY - (rect.top  + rect.height / 2)) / rect.height;
      parallaxEl.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    parallaxEl.addEventListener("mouseleave", () => (parallaxEl.style.transform = ""));
  }

  // ── Ripple effect ─────────────────────────────────────────────
  document.querySelectorAll(".btn, .list-group-item-action").forEach((el) => {
    el.style.position = el.style.position || "relative";
    el.style.overflow = "hidden";
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX-rect.left-d/2}px;top:${e.clientY-rect.top-d/2}px`;
      el.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
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
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // ── Hover lift (data-hover-lift) ──────────────────────────────
  document.querySelectorAll("[data-hover-lift]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform = `translateY(-2px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });

  // ── Gallery navigation (#galPrev / #galNext) ──────────────────
  const gallery = document.getElementById("gallery");
  if (gallery) {
    const gap  = 12;
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
    let isDown = false, startX = 0, startSL = 0, pid = null;
    el.addEventListener("pointerdown", (e) => {
      isDown = true; pid = e.pointerId;
      el.setPointerCapture?.(pid);
      startX = e.clientX; startSL = el.scrollLeft;
      el.classList.add("is-dragging");
    });
    el.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      el.scrollLeft = startSL - (e.clientX - startX);
      e.preventDefault();
    }, { passive: false });
    const end = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("is-dragging");
      try { el.releasePointerCapture?.(pid); } catch (_) {}
      pid = null;
    };
    el.addEventListener("pointerup",     end);
    el.addEventListener("pointerleave",  end);
    el.addEventListener("pointercancel", end);
  });

  // ── News filter ───────────────────────────────────────────────
  const filterBtns = document.querySelectorAll(".news-filter-btn");
  if (filterBtns.length) {
    const cols = Array.from(document.querySelectorAll(".news-card-col"));
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;

        cols.forEach((col) => {
          const badges = Array.from(col.querySelectorAll(".badge")).map((b) => b.textContent.trim());
          const show   = filter === "all" || badges.some((b) => b.includes(filter));

          if (show) {
            col.style.display = "";
            requestAnimationFrame(() => col.classList.remove("filter-out"));
          } else {
            col.classList.add("filter-out");
            col.addEventListener(
              "transitionend",
              () => { if (col.classList.contains("filter-out")) col.style.display = "none"; },
              { once: true }
            );
          }
        });
      });
    });
  }

  // ── TOC: generate & active section highlight ──────────────────
  const tocList = document.querySelector(".toc-list");
  if (tocList && "IntersectionObserver" in window) {
    const headings = Array.from(document.querySelectorAll("main h2")).filter(
      (h) => h.textContent.trim()
    );
    headings.forEach((h, i) => {
      if (!h.id) h.id = `toc-h-${i}`;
      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.href        = `#${h.id}`;
      a.textContent = h.textContent.replace(/\s+/g, " ").trim().slice(0, 22);
      a.className   = "toc-link";

      // h2 が Bootstrap collapse の中に閉じ込められているか調べる
      const collapseEl = h.closest(".collapse");

      a.addEventListener("click", (e) => {
        e.preventDefault();

        const doScroll = () => {
          setTimeout(() => h.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
        };

        if (collapseEl && !collapseEl.classList.contains("show")) {
          // collapse を開いてからスクロール
          if (typeof bootstrap !== "undefined") {
            bootstrap.Collapse.getOrCreateInstance(collapseEl).show();
            collapseEl.addEventListener("shown.bs.collapse", doScroll, { once: true });
          }
        } else {
          doScroll();
        }

        history.replaceState(null, "", `#${h.id}`);
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    const tocLinks = Array.from(tocList.querySelectorAll(".toc-link"));
    let activeLink = null;
    const setActive = (link) => {
      activeLink?.classList.remove("toc-active");
      activeLink = link;
      activeLink?.classList.add("toc-active");
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = tocLinks.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
            if (link) setActive(link);
          }
        });
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 }
    );
    headings.forEach((h) => io.observe(h));
  }

})();
