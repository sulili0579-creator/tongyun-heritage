/**
 * redesign v2 — 站点行为
 * 数据单一来源：js/data.js（window.SITE_DATA）、js/library-data.js（window.LIBRARY）
 * 本文件只负责呈现，不复制任何内容数据。
 */
(function () {
  "use strict";

  var ROOT = ".";
  function A(p) { return ROOT + "/" + String(p || "").replace(/^\.?\//, ""); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var data = window.SITE_DATA || {};
  var LIB = window.LIBRARY || null;

  /* 各传承人对应的访谈 PDF（相对 assets/pdf/） */
  var ORAL_PDFS = {
    zhangwei: [{ label: "张伟 访谈", file: "oral-zhangwei.pdf" }],
    kang: [
      { label: "康贵友 访谈", file: "oral-kang-guiguiyou.pdf" },
      { label: "康勇 访谈", file: "oral-kang-yong.pdf" }
    ],
    zhaokangping: [{ label: "赵康平 访谈", file: "oral-zhaokangping.pdf" }],
    jinyinhuan: [{ label: "金银焕 访谈", file: "oral-jinyinhuan.pdf" }],
    chenzhaocai: [{ label: "陈兆彩 访谈", file: "oral-chenzhaocai.pdf" }]
  };
  var PDF_VIEW = "#toolbar=1&view=FitH&pagemode=bookmarks";

  /* 资料库各表列定义（与原库一致） */
  var LIB_COLS = {
    "古道图片": ["序号", "位置", "编号", "备注"],
    "古道视频": ["序号", "位置", "编号", "文件名"],
    "非遗图片": ["序号", "传承人", "项目", "编号", "备注"],
    "非遗视频": ["序号", "传承人", "项目", "编号", "文件名"],
    "会馆图片": ["序号", "会馆", "编号", "备注"]
  };
  function libRows(cat) {
    return (LIB && LIB[cat] || []).filter(function (r) { return r["序号"] !== "序号"; });
  }
  function libTotal() {
    if (!LIB) return 0;
    return Object.keys(LIB).reduce(function (n, c) { return n + libRows(c).length; }, 0);
  }

  /* ---------- 顶栏滚动态 ---------- */
  var topbar = $(".topbar");
  function onScrollTopbar() {
    if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScrollTopbar, { passive: true });
  onScrollTopbar();

  /* ---------- 移动端菜单 ---------- */
  var toggle = $(".nav-toggle");
  var menu = $("#menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        $all("a", menu).forEach(function (a, i) {
          a.style.transitionDelay = 60 + i * 55 + "ms";
        });
      }
    });
    $all("a", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- 滚动显现 ---------- */
  function observeReveal(root) {
    var els = $all(".reveal", root || document).filter(function (el) { return !el.classList.contains("visible"); });
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -36px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 古道脊线（首页） ---------- */
  (function initRail() {
    var rail = $("#rail");
    if (!rail) return;
    var map = [
      { id: "report", label: "调研报告" },
      { id: "oral", label: "口述史" },
      { id: "film", label: "影像纪实" },
      { id: "libentry", label: "影像资料库" }
    ];
    var track = $(".rail-track", rail);
    var node = $(".rail-node", rail);
    var label = $(".rail-label", rail);
    var readout = $(".rail-readout", rail);
    var ticks = [];

    map.forEach(function (m, i) {
      var t = document.createElement("i");
      t.className = "rail-tick";
      track.appendChild(t);
      ticks.push({ el: t, sec: document.getElementById(m.id), label: m.label, idx: i + 1 });
    });

    function layout() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      ticks.forEach(function (t) {
        if (!t.sec) return;
        var f = Math.min(1, Math.max(0, t.sec.offsetTop / docH));
        t.el.style.top = (8 + f * 84) + "%";
      });
    }
    function update() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var p = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      node.style.top = (8 + p * 84) + "%";
      var mid = window.scrollY + window.innerHeight * 0.4;
      var current = null;
      ticks.forEach(function (t) {
        if (!t.sec) return;
        var passed = mid >= t.sec.offsetTop;
        t.el.classList.toggle("passed", passed);
        if (passed) current = t;
      });
      if (current) {
        label.textContent = current.label;
        readout.textContent = "0" + current.idx + " / 04";
      } else {
        label.textContent = "启程";
        readout.textContent = "00 / 04";
      }
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", function () { layout(); update(); });
    layout();
    update();
  })();

  /* ---------- 斑铜斑点画布（首页 hero） ---------- */
  (function initSpeckles() {
    var canvas = $("#speckles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dots = [];
    var raf = null;
    var running = false;
    var dpr = Math.min(2, window.devicePixelRatio || 1);

    function build() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(230, Math.round(w * h / 13000));
      dots = [];
      for (var i = 0; i < n; i++) {
        var patina = Math.random() < 0.08;
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + Math.random() * Math.random() * 1.9,
          base: 0.12 + Math.random() * 0.5,
          amp: 0.1 + Math.random() * 0.35,
          speed: 0.00025 + Math.random() * 0.0009,
          phase: Math.random() * Math.PI * 2,
          color: patina ? "91, 138, 116" : "208, 165, 92"
        });
      }
    }

    function draw(t) {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var a = d.base + d.amp * Math.sin(t * d.speed + d.phase);
        if (a <= 0.02) continue;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + d.color + "," + a.toFixed(3) + ")";
        ctx.fill();
      }
    }

    function loop(t) {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reducedMotion()) { if (reducedMotion()) draw(4000); return; }
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    build();
    if (reducedMotion()) draw(4000);
    window.addEventListener("resize", function () { build(); if (reducedMotion()) draw(4000); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }).observe(canvas);
    } else {
      start();
    }
  })();

  /* ---------- 首页：口述史名册 ---------- */
  (function initRoster() {
    var list = $("#roster-names");
    var panel = $("#roster-panel");
    if (!list || !panel || !data.oralPeople) return;

    var photo = $(".roster-photo img", panel);
    var photoBox = $(".roster-photo", panel);
    var tagEl = $(".roster-info .tag", panel);
    var nameEl = $(".roster-info h3", panel);
    var roleEl = $(".roster-info .role", panel);
    var descEl = $(".roster-info .desc", panel);
    var linkEl = $(".roster-info .btn", panel);
    var pdfEl = $(".roster-pdfs", panel);
    var people = data.oralPeople;

    // 预载肖像
    people.forEach(function (o) { var im = new Image(); im.src = A(o.img); });

    function select(id) {
      var o = null;
      for (var i = 0; i < people.length; i++) if (people[i].id === id) o = people[i];
      if (!o) return;
      $all(".roster-name", list).forEach(function (b) {
        b.setAttribute("aria-selected", String(b.getAttribute("data-id") === id));
      });
      var pdfs = ORAL_PDFS[o.id] || [];
      tagEl.textContent = o.tag || "";
      nameEl.textContent = o.name || "";
      roleEl.textContent = o.role || "";
      descEl.textContent = o.desc || "";
      linkEl.href = "oral.html?id=" + encodeURIComponent(o.id);
      pdfEl.innerHTML = "访谈 PDF <b>× " + pdfs.length + "</b>";
      if (photo.getAttribute("src") !== A(o.img)) {
        photoBox.classList.add("fading");
        var done = function () {
          photo.removeEventListener("load", done);
          requestAnimationFrame(function () { photoBox.classList.remove("fading"); });
        };
        photo.addEventListener("load", done);
        photo.src = A(o.img);
        photo.alt = o.name || "";
      }
    }

    list.innerHTML = people.map(function (o, i) {
      return '<button class="roster-name" role="tab" data-id="' + esc(o.id) + '" aria-selected="false">' +
        '<span class="no">0' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(o.name) + '</span>' +
        '<span class="rl">' + esc(o.role) + '</span>' +
        '</button>';
    }).join("");

    $all(".roster-name", list).forEach(function (b) {
      b.addEventListener("click", function () { select(b.getAttribute("data-id")); });
    });
    select(people[0].id);
  })();

  /* ---------- 首页：纪录片卡 ---------- */
  (function initFilm() {
    var wrap = $("#film-card");
    if (!wrap || !data.videos || !data.videos[0]) return;
    var v = data.videos[0];
    var poster = $(".film-poster img", wrap);
    poster.src = A(v.poster);
    poster.alt = v.title || "纪录片封面";
    $(".film-caption h3", wrap).textContent = v.title || "";
    $(".film-caption .film-desc", wrap).textContent = v.desc || "";
  })();

  /* ---------- 首页：资料库索引 ---------- */
  (function initLibEntry() {
    var countEl = $("#lib-total");
    if (countEl) countEl.textContent = String(libTotal());
    var cats = $("#libentry-cats");
    if (cats && LIB) {
      cats.innerHTML = Object.keys(LIB).map(function (c) {
        return '<a class="cat-chip" href="library.html?cat=' + encodeURIComponent(c) + '">' +
          esc(c) + "<b>" + libRows(c).length + "</b></a>";
      }).join("");
    }
    var prev = $("#ledger-preview");
    if (prev && LIB) {
      prev.innerHTML = libRows("古道图片").slice(0, 4).map(function (r) {
        return '<div class="ledger-row">' +
          '<span class="l-no">' + esc(r["编号"]) + '</span>' +
          '<span class="l-note">' + esc(r["备注"] || "—") + '</span>' +
          '<span class="l-loc">' + esc(r["位置"] || "") + '</span>' +
          '</div>';
      }).join("");
    }
  })();

  /* ---------- 首页：报告摘要检索 ---------- */
  (function initReportSearch() {
    var input = $("#report-search");
    var out = $("#report-search-result");
    if (!input || !out) return;
    var corpus = (data.reportText || "").replace(/\s+/g, " ").trim();
    input.addEventListener("input", function () {
      var q = input.value.trim();
      if (!q) { out.textContent = ""; out.classList.remove("hit"); return; }
      if (corpus.indexOf(q) !== -1) {
        out.textContent = "摘要中包含「" + q + "」。完整论述请下载 PDF。";
        out.classList.add("hit");
      } else {
        out.textContent = "当前页面摘要未直接命中，可尝试其他词或下载 PDF 全文检索。";
        out.classList.remove("hit");
      }
    });
  })();

  /* ---------- 口述详情页（oral.html?id=…） ---------- */
  (function initOralPage() {
    var page = $('[data-page="oral"]');
    if (!page || !data.oralPeople) return;
    var id = new URLSearchParams(location.search).get("id") || "";
    var o = null;
    for (var i = 0; i < data.oralPeople.length; i++) {
      if (data.oralPeople[i].id === id) o = data.oralPeople[i];
    }
    if (!o) { location.replace("index.html#oral"); return; }

    document.title = o.name + " · 口述史 | 铜运古道非遗数字档案";
    $(".crumb-name").textContent = o.name;
    $("#oral-name").textContent = o.name;
    $("#oral-role").textContent = o.role || "";
    $("#oral-tag").textContent = o.tag || "";
    $("#oral-desc").textContent = o.desc || "";
    var ph = $("#oral-photo");
    ph.src = A(o.img);
    ph.alt = o.name || "";

    var pdfs = ORAL_PDFS[o.id] || [];
    var frame = $("#oral-frame");
    var download = $("#oral-download");
    var docsBar = $("#oral-docs");
    var headTitle = $("#oral-doc-title");

    function use(idx) {
      var pdf = pdfs[idx];
      frame.src = A("assets/pdf/" + pdf.file) + PDF_VIEW;
      frame.title = pdf.label + "全文";
      download.href = A("assets/pdf/" + pdf.file);
      download.setAttribute("download", pdf.file);
      headTitle.textContent = pdf.label + " · 全文在线阅读";
      $all(".doc-tab", docsBar).forEach(function (b, i) {
        b.setAttribute("aria-selected", String(i === idx));
      });
    }

    if (pdfs.length > 1) {
      docsBar.innerHTML = pdfs.map(function (p, i) {
        return '<button class="doc-tab" data-i="' + i + '" aria-selected="false">' + esc(p.label) + '</button>';
      }).join("");
      $all(".doc-tab", docsBar).forEach(function (b) {
        b.addEventListener("click", function () { use(Number(b.getAttribute("data-i")) || 0); });
      });
    } else {
      docsBar.style.display = "none";
    }
    use(0);
  })();

  /* ---------- 资料库页（library.html） ---------- */
  (function initLibrary() {
    var tabsWrap = $("#lib-tabs");
    if (!tabsWrap || !LIB) return;
    var thead = $("#lib-thead");
    var tbody = $("#lib-tbody");
    var countEl = $("#lib-count");
    var search = $("#lib-search");
    var params = new URLSearchParams(location.search);
    var current = params.get("cat");
    if (!LIB[current]) current = Object.keys(LIB)[0];
    var keyword = "";

    tabsWrap.innerHTML = Object.keys(LIB).map(function (c) {
      return '<button class="tab" role="tab" data-cat="' + esc(c) + '" aria-selected="false">' +
        esc(c) + "<b>" + libRows(c).length + "</b></button>";
    }).join("");

    function render() {
      $all(".tab", tabsWrap).forEach(function (b) {
        b.setAttribute("aria-selected", String(b.getAttribute("data-cat") === current));
      });
      var cols = LIB_COLS[current];
      var rows = libRows(current);
      var kw = keyword.toLowerCase();
      if (kw) {
        rows = rows.filter(function (row) {
          return cols.some(function (f) {
            var v = row[f];
            return v && String(v).toLowerCase().indexOf(kw) !== -1;
          });
        });
      }
      thead.innerHTML = "<tr>" + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + cols.length + '">' +
          '<div class="lib-empty"><b>未检索到记录</b>换个关键词，或切换其他类目。</div></td></tr>';
      } else {
        tbody.innerHTML = rows.map(function (row) {
          return "<tr>" + cols.map(function (c) {
            var v = row[c] == null ? "" : String(row[c]);
            return '<td class="' + (c === "编号" ? "mono" : "") + '">' + esc(v) + "</td>";
          }).join("") + "</tr>";
        }).join("");
      }
      countEl.innerHTML = "「" + esc(current) + "」库 · 共 <b>" + rows.length + "</b> 条记录" +
        (kw ? "（关键词：" + esc(keyword) + "）" : "");
      var wrapEl = $(".lib-table-wrap");
      if (wrapEl) {
        wrapEl.classList.remove("lib-fade");
        void wrapEl.offsetWidth;
        wrapEl.classList.add("lib-fade");
      }
    }

    $all(".tab", tabsWrap).forEach(function (b) {
      b.addEventListener("click", function () {
        current = b.getAttribute("data-cat");
        render();
      });
    });
    search.addEventListener("input", function () {
      keyword = search.value.trim();
      render();
    });
    render();
  })();

  /* ---------- 导航高亮（首页） ---------- */
  (function initNavActive() {
    var nav = $(".nav");
    if (!nav) return;
    var links = $all('a[href*="#"]', nav);
    var sections = links.map(function (a) {
      var href = a.getAttribute("href") || "";
      var hash = href.slice(href.indexOf("#") + 1);
      return { a: a, sec: document.getElementById(hash) };
    }).filter(function (x) { return x.sec; });
    if (!sections.length) return;
    function update() {
      var y = window.scrollY + window.innerHeight * 0.38;
      var cur = null;
      sections.forEach(function (x) { if (x.sec.offsetTop <= y) cur = x; });
      sections.forEach(function (x) {
        x.a.classList.toggle("active", x === cur);
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  })();

  observeReveal();
  requestAnimationFrame(function () {
    var hero = $(".hero");
    if (hero) hero.classList.add("loaded");
  });
})();
