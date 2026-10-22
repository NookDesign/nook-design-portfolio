/* ==========================================================
   Lueur｜JavaScript（4つだけ）
   1. 予約ボタン → サンプルである説明のダイアログを開く
   2. スクロールしたらヘッダーにすりガラスの背景を付ける
   3. スマホの固定予約バー：ファーストビューを過ぎたら表示し、最後の予約案内・フッターでは隠す
   4. スクロールに合わせて、文字や写真をふわっと表示する（動きを減らす設定では行わない）
   JavaScript が動かない場合も、予約ボタンはページ下の説明文（#reserve-info）へ移動するだけなので、内容は確認できます。
   ========================================================== */
(function () {
  "use strict";

  /* 1. 予約のダイアログ ------------------------------------ */
  var dialog = document.getElementById("reserve-dialog");
  var opener = null;
  var openedAt = 0;

  if (dialog && typeof dialog.showModal === "function") {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-reserve]");
      if (!button) return;
      event.preventDefault();
      if (dialog.open) return; // 連続で押されても1回だけ開く
      opener = button;
      openedAt = Date.now();
      dialog.showModal();
    });

    dialog.querySelector("[data-dialog-close]").addEventListener("click", function () {
      dialog.close();
    });

    // ダイアログの外側（暗い部分）を押しても閉じる。
    // ただし開いた直後は閉じない（ボタンの2度押し・ダブルタップで、すぐ閉じてしまうのを防ぐ）
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog && Date.now() - openedAt > 500) dialog.close();
    });

    // Esc キーで閉じたときも含め、閉じたら押したボタンに戻る
    dialog.addEventListener("close", function () {
      if (opener && document.contains(opener)) opener.focus();
      opener = null;
    });
  }

  if (!("IntersectionObserver" in window)) return;

  /* 2. ヘッダー -------------------------------------------- */
  var header = document.querySelector("[data-header]");
  var hero = document.querySelector("[data-hero]");
  if (header && hero) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:" + Math.round(window.innerHeight * 0.25) + "px;pointer-events:none;";
    hero.appendChild(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* 3. 固定予約バー ---------------------------------------- */
  var bar = document.querySelector("[data-reserve-bar]");
  if (bar && hero) {
    var pastHero = false;
    var hiders = new Set();
    var update = function () {
      var show = pastHero && hiders.size === 0;
      bar.classList.toggle("is-visible", show);
      // 隠れているときは、キーボード操作でも選ばれないようにする
      if (show) bar.removeAttribute("inert");
      else bar.setAttribute("inert", "");
    };
    update();

    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(hero);

    var hideObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) hiders.add(entry.target);
        else hiders.delete(entry.target);
      });
      update();
    });
    document.querySelectorAll("[data-hide-bar]").forEach(function (el) {
      hideObserver.observe(el);
    });
  }

  /* 4. スクロール表示 --------------------------------------- */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var targets = document.querySelectorAll(
    ".section-head, .concept__photos, .concept__text, .menu__list, .signature__text, .price__group, .flow__photo, .step, .gallery__item, .faq__list, .access__photo, .info-list, .cta__card"
  );
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  targets.forEach(function (el) {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
})();
