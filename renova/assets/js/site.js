/* ==========================================================
   RENOVA｜全ページ共通の JavaScript
   ----------------------------------------------------------
   1. 共通の小さな道具（文字のエスケープ・写真タグの作成）
   2. ヘッダー・フッターを表示（メニューは data.js の SITE.nav）
   3. スマホ用メニューの開閉
   4. スクロールでヘッダーの背景を切りかえ
   5. スクロールでふわっと表示
   6. 写真が読み込めないときの代わりの表示
   7. トップ・ABOUT で使う一覧（お知らせ・施工事例・会社概要）
   8. 別のページを開いたときは、ページの一番上から表示する
   ========================================================== */
(function () {
  "use strict";

  var R = window.RENOVA;
  var SITE = R.SITE;
  var page = document.body.getAttribute("data-page") || "";

  /* ---------- 1. 共通の小さな道具 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // <img> タグを作る。name は assets/images/ からのパス（拡張子なし）。例："photos/works-urban-living-01"
  // photo-sizes.js に軽い WebP（幅800・1200・1600px）が登録されている写真は、
  // srcset で画面の幅に合う大きさをブラウザに選ばせる（スマホで大きな画像を読み込まないため）
  function img(name, alt, opt) {
    opt = opt || {};
    var key = name.replace(/^photos\//, "");
    var info = (R.PHOTOS || {})[key];
    var wh = info ? [info[0], info[1]] : (opt.size || [3, 2]);
    var widths = info ? info[2] : [];
    var src = "assets/images/" + name + ".jpg";
    var srcset = "";
    if (widths.length) {
      src = "assets/images/" + name + "-" + widths[widths.length - 1] + ".webp";
      srcset = ' srcset="' + widths.map(function (w) { return "assets/images/" + name + "-" + w + ".webp " + w + "w"; }).join(", ") + '"' +
        ' sizes="' + (opt.sizes || "(max-width: 767px) 100vw, 50vw") + '"';
    }
    return '<img src="' + src + '"' + srcset +
      ' width="' + wh[0] + '" height="' + wh[1] + '"' +
      ' alt="' + esc(alt) + '" loading="' + (opt.eager ? "eager" : "lazy") + '"' +
      (opt.priority ? ' fetchpriority="high"' : "") + ' decoding="async">';
  }

  function categoryOf(id) {
    for (var i = 0; i < R.CATEGORIES.length; i++) {
      if (R.CATEGORIES[i].id === id) return R.CATEGORIES[i];
    }
    return { id: id, label: id, ja: id };
  }

  // 事例カード（トップ・一覧・詳細ページで共通）
  function workCard(w, opt) {
    opt = opt || {};
    var cat = categoryOf(w.category);
    return '<a class="card' + (opt.reveal === false ? "" : " reveal reveal-img") + '" href="works-detail.html?id=' + esc(w.id) + '" data-category="' + esc(w.category) + '">' +
      '<div class="card__media media zoom">' + img(w.images.main, w.alt.main, { sizes: opt.sizes, eager: opt.eager, priority: opt.priority }) + '</div>' +
      '<div class="card__body">' +
        '<span class="card__no">' + esc(w.no) + '</span>' +
        '<h3 class="card__title">' + esc(w.title) + '</h3>' +
        '<p class="card__meta"><span>' + esc(cat.ja) + '</span><span>' + esc(w.place) + '</span><span>' + esc(w.size) + '</span></p>' +
        (opt.lead ? '<p class="card__lead">' + esc(w.lead) + '</p>' : "") +
      '</div></a>';
  }

  R.ui = { esc: esc, img: img, workCard: workCard, categoryOf: categoryOf };

  /* ---------- 2. ヘッダー・フッター ---------- */
  function navLinks(cls) {
    return SITE.nav.map(function (n) {
      var current = n.id === page ? ' aria-current="page"' : "";
      return '<li' + (n.id === "contact" && cls === "gnav" ? ' class="gnav__contact"' : "") + '>' +
        '<a href="' + n.href + '"' + current + '>' +
        (cls === "drawer"
          ? '<span class="drawer__en">' + esc(n.label) + '</span><span class="drawer__ja">' + esc(n.ja) + '</span>'
          : esc(n.label)) +
        '</a></li>';
    }).join("");
  }

  var headerSlot = document.querySelector('[data-include="header"]');
  if (headerSlot) {
    var overlay = headerSlot.hasAttribute("data-overlay") ? " data-overlay" : "";
    headerSlot.outerHTML =
      '<p class="demo-bar"><strong>Design sample</strong>　' + esc(SITE.notice) + '</p>' +
      '<header class="site-header"' + overlay + '>' +
        '<div class="site-header__inner">' +
          '<a class="logo" href="index.html"' + (page === "home" ? ' aria-current="page"' : "") + '>' +
            '<span>' + esc(SITE.brand) + '</span><span class="logo__sub">架空のブランド</span>' +
            '<span class="visually-hidden">トップページへ</span></a>' +
          '<nav class="gnav" aria-label="メインメニュー"><ul>' + navLinks("gnav") + '</ul></nav>' +
          '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer">' +
            '<span class="menu-btn__label">Menu</span><span class="menu-btn__lines" aria-hidden="true"></span>' +
            '<span class="visually-hidden">メニューを開く</span></button>' +
        '</div>' +
      '</header>' +
      '<div class="drawer bg-concrete" id="drawer" aria-label="メニュー" role="dialog" aria-modal="true">' +
        '<nav aria-label="メインメニュー（スマートフォン）"><ul class="drawer__list">' +
          '<li><a href="index.html"' + (page === "home" ? ' aria-current="page"' : "") + '><span class="drawer__en">Home</span><span class="drawer__ja">トップ</span></a></li>' +
          navLinks("drawer") + '</ul></nav>' +
        '<div class="drawer__foot">' +
          '<a class="btn btn--light" href="contact.html"><span>相談する（デモ）</span><span class="arrow" aria-hidden="true"></span></a>' +
          '<p>' + esc(SITE.notice) + '</p>' +
        '</div>' +
      '</div>';
  }

  var footerSlot = document.querySelector('[data-include="footer"]');
  if (footerSlot) {
    var year = new Date().getFullYear();
    footerSlot.outerHTML =
      '<footer class="site-footer bg-concrete">' +
        '<div class="container">' +
          '<div class="footer__top">' +
            '<div class="footer__brand">' +
              '<p class="display en">' + esc(SITE.brand) + '</p>' +
              '<p>' + esc(SITE.tagline) + '　' + esc(SITE.taglineEn) + '</p>' +
            '</div>' +
            '<nav class="footer__nav" aria-label="フッターメニュー">' +
              '<a href="index.html"><span class="en">Home</span><span class="ja">トップ</span></a>' +
              SITE.nav.map(function (n) {
                return '<a href="' + n.href + '"><span class="en">' + esc(n.label) + '</span><span class="ja">' + esc(n.ja) + '</span></a>';
              }).join("") +
            '</nav>' +
          '</div>' +
          '<div class="footer__bottom">' +
            '<p class="footer__notice">' + esc(SITE.notice) +
              '掲載している会社情報・施工事例・価格・お知らせはすべて架空のもので、実在する同名・類似名の企業や団体とは関係ありません。' +
              '写真は AI で作成したイメージで、実在する建物ではありません。<br>© ' + year + ' Design sample by Nook Design</p>' +
            '<a class="to-top" href="#top">Page top<span class="arrow" aria-hidden="true"></span></a>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- 3. スマホ用メニュー ---------- */
  var header = document.querySelector(".site-header");
  var btn = document.querySelector(".menu-btn");
  var drawer = document.getElementById("drawer");

  function setMenu(open) {
    if (!btn || !drawer) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.querySelector(".visually-hidden").textContent = open ? "メニューを閉じる" : "メニューを開く";
    btn.querySelector(".menu-btn__label").textContent = open ? "Close" : "Menu";
    drawer.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("is-locked", open);
    if (open) {
      var first = drawer.querySelector("a");
      if (first) first.focus();
    }
  }

  if (btn && drawer) {
    btn.addEventListener("click", function () {
      setMenu(btn.getAttribute("aria-expanded") !== "true");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        setMenu(false);
        btn.focus();
      }
      // メニューを開いている間は、Tab キーの移動をメニューとボタンの中だけにする
      if (e.key === "Tab" && drawer.classList.contains("is-open")) {
        var items = [btn].concat(Array.prototype.slice.call(drawer.querySelectorAll("a, button")));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    // 画面が広くなったら（iPad を横にしたときなど）メニューを閉じる
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* ---------- 8. 別のページを開いたときは一番上から ---------- */
  // サイトがプレビュー画面などの枠の中に表示されると、外側の画面のスクロール位置が残り、
  // 次のページが途中から表示されることがある。そのため、リンクから新しく開いたときだけ
  // ページの一番上を画面に出す。戻る・進む・再読み込み・#付きのリンクはブラウザに任せる。
  // iPhone の Safari では、枠の外側までスクロールを届けるのに「フォーカス（選択状態）」を使う必要があるため、
  // ページ全体（body）にフォーカスを移す方法も合わせて使う。写真の読み込み後にもう一度行う（操作が始まっていれば行わない）。
  (function () {
    var nav = window.performance && performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null;
    if (!nav || nav.type !== "navigate" || location.hash) return;
    var root = document.documentElement;
    var body = document.body;
    var touched = false;
    function toTop() {
      if (touched) return;
      window.scrollTo(0, 0);
      // 見出し用の余白（scroll-padding-top）が効くとヘッダーが隠れるので、この間だけ 0 にする
      var padding = root.style.scrollPaddingTop;
      root.style.scrollPaddingTop = "0px";
      try {
        body.scrollIntoView({ block: "start", behavior: "instant" });
      } catch (e) {
        body.scrollIntoView(true);
      }
      if (!body.hasAttribute("tabindex")) body.setAttribute("tabindex", "-1");
      if (!document.activeElement || document.activeElement === body) {
        try { body.focus({ preventScroll: false }); } catch (e) { body.focus(); }
      }
      root.style.scrollPaddingTop = padding;
    }
    ["touchstart", "wheel", "keydown", "mousedown"].forEach(function (type) {
      window.addEventListener(type, function () { touched = true; }, { once: true, passive: true });
    });
    toTop();
    requestAnimationFrame(toTop);
    window.addEventListener("load", function () { setTimeout(toTop, 0); });
  })();

  /* ---------- 4. ヘッダーの背景 ---------- */
  if (header && header.hasAttribute("data-overlay")) {
    var onScroll = function () {
      header.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 7. 一覧の表示（data.js のデータから作る） ---------- */
  // お知らせ
  var newsEl = document.querySelector("[data-news]");
  if (newsEl) {
    newsEl.innerHTML = SITE.news.map(function (n) {
      return '<li><a href="' + esc(n.href) + '">' +
        '<time datetime="' + esc(n.date) + '">' + esc(n.date.replace(/-/g, ".")) + '</time>' +
        '<span class="label">' + esc(n.category) + '</span>' +
        '<span class="news-list__title">' + esc(n.title) + '</span>' +
        '<span class="arrow" aria-hidden="true"></span></a></li>';
    }).join("");
  }

  // トップの施工事例ピックアップ（data-works-pickup="id,id,id"）
  var pickEl = document.querySelector("[data-works-pickup]");
  if (pickEl) {
    var ids = pickEl.getAttribute("data-works-pickup").split(",");
    pickEl.innerHTML = ids.map(function (id) {
      var w = R.WORKS.filter(function (x) { return x.id === id.trim(); })[0];
      return w ? workCard(w, { sizes: "(max-width: 899px) 100vw, 55vw" }) : "";
    }).join("");
  }

  // 会社概要と対応エリア（ABOUT）
  var profileEl = document.querySelector("[data-company]");
  if (profileEl) {
    profileEl.innerHTML = SITE.company.map(function (c) {
      return '<div><dt>' + esc(c.label) + '</dt><dd>' + esc(c.value) + '</dd></div>';
    }).join("");
  }
  var areaEl = document.querySelector("[data-areas]");
  if (areaEl) {
    areaEl.innerHTML = SITE.areas.map(function (a) {
      return '<li class="area"><p class="area__name">' + esc(a.name) + '</p><p class="area__note">' + esc(a.note) + '</p></li>';
    }).join("");
  }

  /* ---------- 5. スクロールでふわっと表示 ---------- */
  R.observeReveal = function (root) {
    var els = (root || document).querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  };
  R.observeReveal();

  /* ---------- 6. 写真が読み込めないとき ---------- */
  // 画像が壊れたら隠し、下地（.media の質感のある面）に「RENOVA」の文字を出す
  // （読み込み中は文字を出さず、質感のある面だけを見せる）
  function markBroken(im) {
    im.classList.add("is-broken");
    var m = im.closest(".media");
    if (m) m.classList.add("is-broken");
  }
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG") markBroken(t);
  }, true);
  Array.prototype.forEach.call(document.images, function (im) {
    // 遅延読み込み（loading="lazy"）でまだ読み込んでいない画像は対象外
    if (im.loading !== "lazy" && im.complete && im.naturalWidth === 0 && im.getAttribute("src")) markBroken(im);
  });
})();
