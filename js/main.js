(function () {
  const data = window.SITE_DATA || {};

  /* Hero 多图自动轮播 */
  (function initHeroSlider() {
    const slidesWrap = document.getElementById("hero-slides");
    const dotsWrap = document.getElementById("hero-dots");
    const prevBtn = document.getElementById("hero-prev");
    const nextBtn = document.getElementById("hero-next");
    if (!slidesWrap) return;

    const slides = (data.heroSlides && data.heroSlides.length
      ? data.heroSlides
      : [{ src: "", alt: "背景" }]
    ).slice();
    const interval = Number(data.heroInterval) || 5000;
    let index = 0;
    let timer = null;
    let reducedMotion = false;
    try {
      reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}

    slidesWrap.innerHTML = slides
      .map((s, i) => {
        const src = s.src || "";
        const alt = s.alt || "背景图 " + (i + 1);
        const img = src
          ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" decoding="async" ${i === 0 ? "fetchpriority=\"high\"" : "loading=\"lazy\""} />`
          : "";
        return `<div class="hero-slide${i === 0 ? " is-active" : ""}" data-i="${i}" role="group" aria-roledescription="幻灯片" aria-label="${i + 1} / ${slides.length}">${img}</div>`;
      })
      .join("");

    if (dotsWrap) {
      dotsWrap.innerHTML = slides
        .map(
          (_, i) =>
            `<button type="button" role="tab" aria-label="第 ${i + 1} 张" aria-selected="${i === 0}" class="${i === 0 ? "is-active" : ""}" data-i="${i}"></button>`
        )
        .join("");
    }

    const slideEls = Array.from(slidesWrap.querySelectorAll(".hero-slide"));
    slideEls.forEach((el) => {
      const img = el.querySelector("img");
      if (!img) return;
      const mark = () => el.classList.add("has-img");
      if (img.complete && img.naturalWidth) mark();
      img.addEventListener("load", mark);
      img.addEventListener("error", () => {
        img.remove();
        el.classList.remove("has-img");
      });
    });

    function go(to) {
      if (!slides.length) return;
      index = (to + slides.length) % slides.length;
      slideEls.forEach((el, i) => el.classList.toggle("is-active", i === index));
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach((btn, i) => {
          const on = i === index;
          btn.classList.toggle("is-active", on);
          btn.setAttribute("aria-selected", String(on));
        });
      }
    }

    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (reducedMotion || slides.length < 2) return;
      timer = setInterval(next, interval);
    }

    prevBtn?.addEventListener("click", () => { prev(); start(); });
    nextBtn?.addEventListener("click", () => { next(); start(); });
    dotsWrap?.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        go(Number(btn.getAttribute("data-i")) || 0);
        start();
      });
    });

    const slider = document.getElementById("hero-slider");
    slider?.addEventListener("mouseenter", stop);
    slider?.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    // 触控滑动
    let touchX = null;
    slider?.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    slider?.addEventListener(
      "touchend",
      (e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) next();
        else prev();
        start();
      },
      { passive: true }
    );

    start();
  })();

  /* 顶栏滚动态 */
  const header = document.getElementById("site-header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* 移动端导航 */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* 导航高亮 */
  const sections = ["home", "reports", "oral", "videos", "library"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];

  function updateActiveNav() {
    const y = window.scrollY + 100;
    let current = "home";
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* 滚动显现 */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* 报告摘要检索 */
  const reportInput = document.getElementById("report-search");
  const reportResult = document.getElementById("report-search-result");
  if (reportInput && reportResult) {
    const corpus = (data.reportText || "").replace(/\s+/g, " ").trim();
    reportInput.addEventListener("input", () => {
      const q = reportInput.value.trim();
      if (!q) {
        reportResult.textContent = "";
        return;
      }
      if (corpus.includes(q)) {
        reportResult.textContent = "摘要中包含「" + q + "」。完整论述请下载 PDF。";
      } else {
        reportResult.textContent = "当前页面摘要未直接命中，可尝试其他词或下载 PDF 全文检索。";
      }
    });
  }

  /* 口述史（传承人卡片，点击进详情页） */
  const oralList = document.getElementById("oral-list");
  if (oralList && data.oralPeople) {
    oralList.innerHTML = data.oralPeople
      .map(
        (o, i) => `
      <a class="oral-card reveal" style="transition-delay:${i * 70}ms" href="${escapeAttr(o.href || "#")}">
        <div class="oral-photo">
          <img alt="${escapeAttr(o.name)}" src="${escapeAttr(o.img || "")}" loading="lazy" />
          <span class="oral-tag">${escapeHtml(o.tag || "")}</span>
        </div>
        <div class="oral-body">
          <h3>${escapeHtml(o.name)}</h3>
          <p class="oral-role">${escapeHtml(o.role || "")}</p>
          <p class="oral-desc">${escapeHtml(o.desc || "")}</p>
          <span class="oral-more">阅读访谈全文 →</span>
        </div>
      </a>`
      )
      .join("");
    oralList.querySelectorAll(".oral-photo img").forEach((img) => {
      img.addEventListener("error", () => {
        const ph = img.parentElement;
        if (ph) {
          ph.classList.add("no-photo");
          ph.setAttribute("data-name", img.getAttribute("alt") || "");
        }
      });
    });
    observeNewReveals(oralList);
  }


  /* 视频（卡片 → 点击进详情页） */
  const videoList = document.getElementById("video-list");
  if (videoList && data.videos) {
    videoList.innerHTML = data.videos
      .map(
        (v, i) => `
      <a class="video-card reveal" style="transition-delay:${i * 80}ms" href="${escapeAttr(v.href || "#")}">
        <div class="video-poster">
          ${v.poster
            ? `<img alt="${escapeAttr(v.title)}" src="${escapeAttr(v.poster)}" loading="lazy" />`
            : `<video muted preload="metadata" src="${escapeAttr(v.src || "")}#t=0.1"></video>`}
          <span class="video-badge">▶ 播放</span>
        </div>
        <div class="video-body">
          <h3>${escapeHtml(v.title)}</h3>
          <p>${escapeHtml(v.desc || "")}</p>
          <span class="oral-more">进入观看 →</span>
        </div>
      </a>`
      )
      .join("");
    observeNewReveals(videoList);
  }

  /* 团队成员 */
  function observeNewReveals(root) {
    const nodes = root.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("visible");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      nodes.forEach((el) => io.observe(el));
    } else {
      nodes.forEach((el) => el.classList.add("visible"));
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }
})();
