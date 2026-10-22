// NOVA AI ランディングページの動き
// 1. ヘッダー（スクロールで背景を濃くする）
// 2. スマートフォンのメニュー開閉
// 3. いま見ているセクションをメニューで強調する
// 4. よくある質問の開閉
// 5. 料金の月払い・年払いの切りかえ
// 6. 比較表のプラン切りかえ（スマートフォン）
// 7. 有料プランのボタンの案内ダイアログ（有料プランは準備中で、申し込みはできません）
// 8. スクロールで少しずつ表示する
(function () {
  "use strict";

  var root = document.documentElement;

  // ---------- 1. ヘッダー ----------
  var header = document.querySelector("[data-header]");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------- 2. スマートフォンのメニュー ----------
  var nav = document.querySelector("[data-nav]");
  var menuBtn = document.querySelector("[data-menu-btn]");
  var menuLabel = document.querySelector("[data-menu-label]");
  var mobileQuery = window.matchMedia("(max-width: 959px)");

  function setMenu(open, returnFocus) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "メニューを閉じる" : "メニューを開く";
    nav.classList.toggle("is-open", open);
    if (!open && returnFocus) menuBtn.focus();
  }

  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  });

  // メニューの中のリンクを押したら閉じる
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a") && mobileQuery.matches) setMenu(false);
  });

  // Esc キー・メニューの外側を押したときに閉じる
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setMenu(false);
  });

  // 画面を横にしてPCの幅になったら、開いたメニューを元に戻す
  mobileQuery.addEventListener("change", function (e) {
    if (!e.matches) setMenu(false);
  });

  // ---------- 3. いま見ているセクションをメニューで強調 ----------
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__list a"));
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    ["top", "problem", "studio", "features", "benefits", "pricing", "faq", "cta"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  // ---------- 4. よくある質問の開閉 ----------
  document.querySelectorAll(".faq__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.closest(".faq__item").classList.toggle("is-open", open);
    });
  });

  // ---------- 5. 料金の月払い・年払い ----------
  var billingBtns = document.querySelectorAll("[data-billing]");
  billingBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-billing"); // "monthly" または "yearly"
      billingBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".plan [data-monthly]").forEach(function (el) {
        var next = el.getAttribute("data-" + type);
        if (el.textContent === next) return;
        el.textContent = next;
        if (el.classList.contains("plan__amount")) {
          el.classList.remove("is-changing");
          void el.offsetWidth; // アニメーションをやり直すため
          el.classList.add("is-changing");
        }
      });
    });
  });

  // ---------- 6. 比較表のプラン切りかえ（スマートフォン） ----------
  var table = document.querySelector("[data-compare-table]");
  var compareBtns = document.querySelectorAll("[data-compare]");
  compareBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      compareBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      table.setAttribute("data-active", btn.getAttribute("data-compare"));
    });
  });

  // ---------- 7. 有料プランのボタンの案内ダイアログ ----------
  var dialog = document.getElementById("demo-dialog");
  var dialogPlan = document.querySelector("[data-dialog-plan]");
  var canUseDialog = dialog && typeof dialog.showModal === "function";

  document.querySelectorAll("[data-demo-cta]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      // ダイアログが使えない古いブラウザでは、短い案内だけ出す
      if (!canUseDialog) {
        window.alert("有料プランは準備中のため、まだお申し込みできません。");
        return;
      }
      e.preventDefault();
      var label = link.getAttribute("data-demo-cta");
      var yearly = document.querySelector('[data-billing="yearly"].is-active');
      if (/スタンダード|ビジネス/.test(label)) label += yearly ? "（年払い）" : "（月払い）";
      dialogPlan.textContent = label;
      if (nav.classList.contains("is-open")) setMenu(false);
      dialog.showModal();
    });
  });

  if (canUseDialog) {
    dialog.querySelector("[data-dialog-close]").addEventListener("click", function () {
      dialog.close();
    });
    // 「無料で文章を作る」：ダイアログを閉じてから、作成画面（#studio）へ移動する
    dialog.querySelector("[data-dialog-studio]").addEventListener("click", function () {
      dialog.close();
    });
    // ダイアログの外側（暗い部分）を押したら閉じる
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  // ---------- 8. スクロールで少しずつ表示 ----------
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    root.classList.add("motion");
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        revealer.unobserve(el);
        // 表示し終わったら時間差を消す（ほかの動きが遅れないように）
        setTimeout(function () { el.style.transitionDelay = ""; }, 1200);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      // 横に並んだカードは、少しずつ時間をずらして表示する
      var siblings = el.parentElement.querySelectorAll(":scope > [data-reveal]");
      var index = Array.prototype.indexOf.call(siblings, el);
      if (siblings.length > 1 && index > 0) el.style.transitionDelay = Math.min(index, 4) * 0.08 + "s";
      revealer.observe(el);
    });
  }
})();
