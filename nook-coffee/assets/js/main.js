/* ==========================================================================
   NOOK COFFEE（架空のカフェ）— 共通スクリプト
   --------------------------------------------------------------------------
   1. 共通ヘッダー・フッターを全ページに表示（文言の修正はここだけでOK）
   2. スマートフォン用メニューの開閉
   3. スクロールでヘッダーの背景を付ける
   4. 写真が読み込めなかったときの表示
   5. スクロールに合わせて要素をふわっと表示
   6. お知らせの絞り込み（news.html）
   ========================================================================== */
(function () {
  "use strict";

  /* ナビゲーションの項目（順番を変えるとヘッダーとフッターの両方に反映） */
  var NAV_ITEMS = [
    { key: "home", href: "index.html", en: "Home", jp: "ホーム" },
    { key: "menu", href: "menu.html", en: "Menu", jp: "メニュー" },
    { key: "about", href: "about.html", en: "About", jp: "私たちについて" },
    { key: "news", href: "news.html", en: "News", jp: "お知らせ" },
    { key: "access", href: "access.html", en: "Access", jp: "店舗情報・アクセス" }
  ];

  /* 店舗情報（すべて架空の設定） */
  var SHOP = {
    hours: "平日 8:00–20:00 ／ 土日祝 9:00–19:00",
    closed: "水曜日",
    address: "〒000-0000 東京都架空区 珈琲町1-2-3 NOOKビル1F"
  };

  var currentPage = document.body.getAttribute("data-page") || "";

  function navLinks(className, withJp) {
    return NAV_ITEMS.map(function (item) {
      var current = item.key === currentPage ? ' aria-current="page"' : "";
      var inner = withJp
        ? '<span class="global-nav__en">' + item.en + '</span><span class="global-nav__jp">' + item.jp + "</span>"
        : '<span class="en">' + item.en + "</span>" + item.jp;
      return '<li><a class="' + className + '" href="' + item.href + '"' + current + ">" + inner + "</a></li>";
    }).join("");
  }

  var headerHTML =
    '<header class="site-header" id="site-header">' +
    '<p class="notice-bar"><strong>A fictional cafe.</strong>架空のカフェのデザインサンプルです</p>' +
    '<div class="container site-header__inner">' +
    '<a class="brand" href="index.html" aria-label="NOOK COFFEE トップページへ">' +
    '<span class="brand__name">NOOK</span><span class="brand__sub">COFFEE</span>' +
    "</a>" +
    '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="global-nav">' +
    '<span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>' +
    '<span class="visually-hidden" data-toggle-label>メニューを開く</span>' +
    "</button>" +
    '<nav class="global-nav" id="global-nav" aria-label="メインメニュー">' +
    '<ul class="global-nav__list">' + navLinks("global-nav__link", true) + "</ul>" +
    '<p class="global-nav__extra">' + SHOP.hours + "<br>定休日：" + SHOP.closed + "<br>※ 架空の店舗・営業時間です</p>" +
    "</nav>" +
    "</div>" +
    "</header>";

  var year = new Date().getFullYear();

  var footerHTML =
    '<footer class="site-footer">' +
    '<a class="page-top" href="#top" aria-label="ページの先頭へ戻る">TOP</a>' +
    '<div class="container">' +
    '<div class="site-footer__grid">' +
    '<div class="site-footer__about">' +
    '<a class="brand" href="index.html" aria-label="NOOK COFFEE トップページへ">' +
    '<span class="brand__name">NOOK</span><span class="brand__sub">COFFEE</span>' +
    "</a>" +
    '<p class="site-footer__lead">街の片隅（nook）で、一杯のコーヒーと静かに向き合う。自家焙煎のスペシャルティコーヒーと焼き菓子の店です。</p>' +
    "</div>" +
    "<div>" +
    '<h2 class="site-footer__heading">Pages</h2>' +
    '<ul class="site-footer__nav">' + navLinks("", false) + "</ul>" +
    "</div>" +
    "<div>" +
    '<h2 class="site-footer__heading">Shop</h2>' +
    '<dl class="site-footer__info">' +
    "<dt>Hours</dt><dd>" + SHOP.hours + "</dd>" +
    "<dt>Closed</dt><dd>" + SHOP.closed + "</dd>" +
    "<dt>Address</dt><dd>" + SHOP.address + "</dd>" +
    "<dt>Follow</dt><dd>" +
    '<a class="text-link external-link" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram<span class="visually-hidden">（デモ用リンク：Instagram のトップページが新しいタブで開きます）</span></a>' +
    "</dd>" +
    "</dl>" +
    "</div>" +
    "</div>" +
    '<div class="site-footer__bottom">' +
    '<p class="site-footer__disclaimer">' +
    "※ このサイトは Nook Design のポートフォリオ用に制作した<strong>架空のカフェ</strong>のWebサイトです。店舗名・住所・営業時間・価格・お知らせはすべて架空の設定で、実在の店舗・団体とは関係ありません。掲載している写真はAIで生成したイメージ画像です。" +
    "</p>" +
    '<p class="site-footer__copy">' +
    '<a class="text-link site-footer__works" href="https://nookdesign.github.io/nook-design-portfolio/">← Nook Design 制作実績へ戻る</a>' +
    'Design &amp; Coding: <a class="text-link" href="https://nookdesign.github.io/">Nook Design</a> ／ &copy; ' + year + " NOOK COFFEE (fictional)</p>" +
    "</div>" +
    "</div>" +
    "</footer>";

  var headerSlot = document.querySelector('[data-include="header"]');
  var footerSlot = document.querySelector('[data-include="footer"]');
  if (headerSlot) headerSlot.innerHTML = headerHTML;
  if (footerSlot) footerSlot.innerHTML = footerHTML;

  /* 2. スマートフォン用メニュー ------------------------------------------- */
  var root = document.documentElement;
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("global-nav");
  var toggleLabel = document.querySelector("[data-toggle-label]");
  var desktopQuery = window.matchMedia("(min-width: 960px)");

  function setNav(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (toggleLabel) toggleLabel.textContent = open ? "メニューを閉じる" : "メニューを開く";
    nav.classList.toggle("is-open", open);
    root.classList.toggle("is-nav-open", open);
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true", false);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) setNav(false, true);
    });

    /* メニューを開いたまま画面が広がったら閉じる（スクロールできなくなるのを防ぐ） */
    var onDesktop = function (event) {
      if (event.matches) setNav(false, false);
    };
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", onDesktop);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(onDesktop);
    }
  }

  /* 3. スクロールでヘッダーの背景を付ける ---------------------------------- */
  var header = document.getElementById("site-header");
  var ticking = false;

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateHeader();

  /* 4. 写真が読み込めなかったときの表示 ------------------------------------ */
  function markMissing(img) {
    var frame = img.closest(".media");
    if (frame) frame.classList.add("is-missing");
  }

  Array.prototype.forEach.call(document.querySelectorAll(".media img"), function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
      markMissing(img);
    } else {
      img.addEventListener("error", function () {
        markMissing(img);
      });
    }
  });

  /* 5. スクロールに合わせて表示 ------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    Array.prototype.forEach.call(reveals, function (el) {
      observer.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-visible");
    });
  }

  /* 6. お知らせの絞り込み ------------------------------------------------- */
  var filter = document.querySelector("[data-news-filter]");
  if (filter) {
    var buttons = filter.querySelectorAll("button[data-filter]");
    var items = document.querySelectorAll("[data-category]");
    var status = document.querySelector("[data-filter-status]");

    filter.hidden = false;

    filter.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-filter]");
      if (!button) return;
      var value = button.getAttribute("data-filter");
      var shown = 0;

      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-pressed", b === button ? "true" : "false");
      });

      Array.prototype.forEach.call(items, function (item) {
        var match = value === "all" || item.getAttribute("data-category") === value;
        item.hidden = !match;
        if (match) shown += 1;
      });

      if (status) status.textContent = button.textContent.trim() + "：" + shown + "件を表示しています";
    });
  }
})();
