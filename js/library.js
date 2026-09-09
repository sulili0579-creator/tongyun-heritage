(function () {
  const data = window.LIBRARY || {};

  // 各表的列定义
  const cols = {
    古道图片: ["序号", "位置", "编号", "备注"],
    古道视频: ["序号", "位置", "编号", "文件名"],
    非遗图片: ["序号", "传承人", "项目", "编号", "备注"],
    非遗视频: ["序号", "传承人", "项目", "编号", "文件名"],
    会馆图片: ["序号", "会馆", "编号", "备注"]
  };
  // 记录字段名可能与列名不同，统一映射
  const mapField = {
    古道图片: { 序号: "序号", 位置: "位置", 编号: "编号", 备注: "备注" },
    古道视频: { 序号: "序号", 位置: "位置", 编号: "编号", 文件名: "文件名" },
    非遗图片: { 序号: "序号", 传承人: "传承人", 项目: "项目", 编号: "编号", 备注: "备注" },
    非遗视频: { 序号: "序号", 传承人: "传承人", 项目: "项目", 编号: "编号", 文件名: "文件名" },
    会馆图片: { 序号: "序号", 会馆: "会馆", 编号: "编号", 备注: "备注" }
  };

  const tabs = document.querySelectorAll("#lib-tabs .filter-btn");
  const thead = document.getElementById("lib-thead");
  const tbody = document.getElementById("lib-tbody");
  const countEl = document.getElementById("lib-count");
  const searchInput = document.getElementById("lib-search");

  let currentCat = "古道图片";
  let keyword = "";

  function activeData(cat) {
    return (data[cat] || []).slice();
  }

  function renderHeaders(cat) {
    thead.innerHTML = "<tr>" + cols[cat].map((c) => `<th>${escapeHtml(c)}</th>`).join("") + "</tr>";
  }

  function renderRows(cat, kw) {
    const list = activeData(cat);
    const m = mapField[cat];
    let rows = list;
    if (kw) {
      rows = list.filter((row) => {
        return Object.keys(m).some((field) => {
          const v = row[field];
          return v && String(v).toLowerCase().includes(kw.toLowerCase());
        });
      });
    }
    countEl.textContent = `共 ${rows.length} 条记录` + (kw ? `（来自“${cat}”库）` : `（来自“${cat}”库）`);
    tbody.innerHTML = rows
      .map(
        (row) =>
          "<tr>" +
          cols[cat].map((c) => {
            const key = m[c];
            let val = row[key] == null ? "" : String(row[key]);
            // 去掉编号前的空格/下划线前缀装饰
            return `<td class="${c === "编号" ? "mono" : ""}">${escapeHtml(val)}</td>`;
          }).join("") +
          "</tr>"
      )
      .join("");
  }

  function render(cat, kw) {
    renderHeaders(cat);
    renderRows(cat, kw);
    observeReveal();
  }

  function observeReveal() {
    const trs = tbody.querySelectorAll("tr");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.05 }
      );
      trs.forEach((tr) => io.observe(tr));
    } else {
      trs.forEach((tr) => tr.classList.add("in"));
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.getAttribute("data-cat");
      render(currentCat, keyword);
    });
  });

  searchInput.addEventListener("input", () => {
    keyword = searchInput.value.trim();
    render(currentCat, keyword);
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 初始渲染
  render(currentCat, keyword);
})();
