/* ==========================================================
   RENOVA｜施工事例一覧（works.html）
   - data.js の WORKS からカードを作る
   - カテゴリーのボタンで表示する事例を切りかえる
   - 選んだカテゴリーは URL（?category=house など）にも残す
   ========================================================== */
(function () {
  "use strict";

  var R = window.RENOVA;
  var ui = R.ui;
  var list = document.querySelector("[data-works-list]");
  var filterEl = document.querySelector("[data-filter]");
  var status = document.querySelector("[data-status]");
  if (!list || !filterEl) return;

  // カードを表示（画面の最初に見える2件は、遅延させずにすぐ読み込む。1件目は最優先）
  list.innerHTML = R.WORKS.map(function (w, i) {
    return ui.workCard(w, { lead: true, eager: i < 2, priority: i === 0, sizes: "(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 55vw" });
  }).join("") + '<p class="works-empty" hidden data-empty>この条件の施工事例はまだありません。</p>';

  // 件数つきのボタンを表示
  filterEl.innerHTML = R.CATEGORIES.map(function (c) {
    var n = c.id === "all" ? R.WORKS.length : R.WORKS.filter(function (w) { return w.category === c.id; }).length;
    return '<button class="filter__btn" type="button" aria-pressed="false" data-cat="' + c.id + '">' +
      '<span class="en" lang="en">' + ui.esc(c.label) + '</span><span>' + ui.esc(c.ja) + '</span><sup>' + n + '</sup></button>';
  }).join("");

  var cards = Array.prototype.slice.call(list.querySelectorAll(".card"));
  var buttons = Array.prototype.slice.call(filterEl.querySelectorAll(".filter__btn"));
  var empty = list.querySelector("[data-empty]");

  function apply(cat, updateUrl) {
    var valid = R.CATEGORIES.some(function (c) { return c.id === cat; });
    if (!valid) cat = "all";
    var shown = 0;
    cards.forEach(function (card) {
      var hit = cat === "all" || card.getAttribute("data-category") === cat;
      card.hidden = !hit;
      // 表示中の順番で並び方（非対称レイアウト）を決める
      if (hit) {
        card.setAttribute("data-pos", String(shown % 6));
        // 絞り込んだあとは、ふわっと表示を待たずにすぐ見せる
        if (updateUrl) card.classList.add("is-in");
        shown++;
      }
    });
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-cat") === cat ? "true" : "false");
    });
    empty.hidden = shown > 0;
    var label = R.CATEGORIES.filter(function (c) { return c.id === cat; })[0];
    status.textContent = label.ja + "：" + shown + "件の施工事例";

    if (updateUrl && window.history && history.replaceState) {
      var url = cat === "all" ? location.pathname : location.pathname + "?category=" + cat;
      history.replaceState(null, "", url);
    }
  }

  filterEl.addEventListener("click", function (e) {
    var b = e.target.closest(".filter__btn");
    if (b) apply(b.getAttribute("data-cat"), true);
  });

  var params = new URLSearchParams(location.search);
  apply(params.get("category") || "all", false);
  R.observeReveal(list);
})();
