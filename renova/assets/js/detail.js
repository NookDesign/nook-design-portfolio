/* ==========================================================
   RENOVA｜施工事例の詳細（works-detail.html?id=○○）
   1. URL の id から事例データを探して、ページを組み立てる
   2. ビフォー・アフターの比較（つまみを左右に動かす）
   3. 写真の拡大表示（ライトボックス）
      - 写真をクリック／タップで開く
      - ← → キー、画面の左右スワイプで前後の写真
      - Esc キー、× ボタン、写真の外側のタップ、下へのスワイプで閉じる
   ========================================================== */
(function () {
  "use strict";

  var R = window.RENOVA;
  var ui = R.ui;
  var esc = ui.esc;
  var main = document.querySelector("[data-detail]");
  if (!main) return;

  var id = new URLSearchParams(location.search).get("id");
  var index = -1;
  R.WORKS.forEach(function (w, i) { if (w.id === id) index = i; });

  /* ---------- 事例が見つからないとき ---------- */
  if (index < 0) {
    document.title = "施工事例が見つかりません｜RENOVA（架空のブランド）";
    main.innerHTML =
      '<section class="detail-missing bg-plaster bg-blueprint"><div class="container">' +
        '<p class="display en" lang="en">Not found</p>' +
        '<h1 class="h2">お探しの施工事例は見つかりませんでした。</h1>' +
        '<p class="muted">URL が変わったか、掲載を終了した可能性があります。</p>' +
        '<p class="detail-missing__action"><a class="btn" href="works.html"><span>施工事例の一覧へ</span><span class="arrow" aria-hidden="true"></span></a></p>' +
      '</div></section>';
    return;
  }

  var w = R.WORKS[index];
  var cat = ui.categoryOf(w.category);
  var prev = R.WORKS[(index - 1 + R.WORKS.length) % R.WORKS.length];
  var next = R.WORKS[(index + 1) % R.WORKS.length];
  var others = [1, 2, 3].map(function (k) { return R.WORKS[(index + k) % R.WORKS.length]; });

  // ページのタイトルと説明文を、この事例の内容にする
  document.title = w.title + "｜施工事例 " + w.no + "（架空のブランド RENOVA）";
  var desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", w.title + "：" + w.lead + "（ポートフォリオ用の架空の施工事例です）");

  // ギャラリーに出す写真（data.js で images に書いてあるものだけ。品質が足りない写真は data.js から外す）
  var GALLERY = [
    { key: "g1", ratio: "4 / 5", size: [1200, 1500], sizes: "(max-width: 767px) 100vw, 42vw" },
    { key: "g2", ratio: "3 / 2", size: [1600, 1067], sizes: "(max-width: 767px) 84vw, 44vw" },
    { key: "g3", ratio: "4 / 3", size: [1400, 1050], sizes: "(max-width: 767px) 100vw, 58vw" }
  ].filter(function (g) { return w.images[g.key]; });

  // ライトボックスで順番に見る写真（メイン → ギャラリー → 改修前）
  var photos = [{ name: w.images.main, alt: w.alt.main, cap: "Main — " + w.alt.main }]
    .concat(GALLERY.map(function (g) { return { name: w.images[g.key], alt: w.alt[g.key], cap: w.alt[g.key] }; }))
    .concat(w.images.before ? [{ name: w.images.before, alt: w.alt.before, cap: "Before — " + w.alt.before }] : []);

  function galleryItem(i, ratio, size, sizes) {
    var p = photos[i];  // i は photos の番号（0 はメイン写真）
    return '<figure class="gallery__item reveal reveal-img">' +
      '<button class="gallery__btn" type="button" data-open="' + i + '" style="--ar:' + ratio + '">' +
        '<span class="media zoom">' + ui.img(p.name, p.alt, { size: size, sizes: sizes }) +
          '<span class="gallery__zoom" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.5 12.5L17 17M8.5 6v5M6 8.5h5"/></svg></span>' +
        '</span>' +
        '<span class="visually-hidden">写真を拡大する</span>' +
      '</button>' +
      '<figcaption><span class="caption__no">' + String(i).padStart(2, "0") + '</span>' + esc(p.alt) + '</figcaption>' +
    '</figure>';
  }

  main.innerHTML =
    /* --- タイトル --- */
    '<header class="detail-head bg-plaster bg-blueprint">' +
      '<div class="container grid-12 detail-head__grid">' +
        '<div class="detail-head__title">' +
          '<nav aria-label="現在地"><ol class="breadcrumb"><li><a href="index.html">Home</a></li><li><a href="works.html">Works</a></li><li aria-current="page">' + esc(w.title) + '</li></ol></nav>' +
          '<p class="label">Case ' + esc(w.no) + ' — ' + esc(cat.ja) + '</p>' +
          '<h1 class="display en" lang="en">' + esc(w.title) + '</h1>' +
          '<p class="lead">' + esc(w.lead) + '</p>' +
        '</div>' +
        '<dl class="spec detail-head__meta">' +
          '<div><dt>所在地</dt><dd>' + esc(w.place) + '（架空）</dd></div>' +
          '<div><dt>種別</dt><dd>' + esc(w.type) + '</dd></div>' +
          '<div><dt>面積</dt><dd>' + esc(w.size) + '</dd></div>' +
        '</dl>' +
      '</div>' +
    '</header>' +

    /* --- メイン写真 --- */
    '<figure class="detail-main bg-plaster">' +
      '<button class="gallery__btn" type="button" data-open="0">' +
        '<span class="media">' + ui.img(w.images.main, w.alt.main, { eager: true, priority: true, sizes: "100vw" }) + '</span>' +
        '<span class="visually-hidden">写真を拡大する</span>' +
      '</button>' +
      '<figcaption><span class="caption__no">fig. 01</span>' + esc(w.alt.main) + '</figcaption>' +
    '</figure>' +

    /* --- コンセプト --- */
    '<section class="section bg-plaster" aria-labelledby="d-concept">' +
      '<div class="container grid-12 split">' +
        '<div class="split__media split__media--head reveal">' +
          '<p class="eyebrow"><span class="eyebrow__num">01</span><span class="eyebrow__line"></span><span class="eyebrow__text">Concept</span></p>' +
          '<h2 class="h2" id="d-concept">設計の考え方</h2>' +
        '</div>' +
        '<div class="split__text text-flow reveal" data-delay="1">' +
          w.concept.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
        '</div>' +
      '</div>' +
    '</section>' +

    /* --- 設計のポイント --- */
    '<section class="section bg-greige" aria-labelledby="d-points">' +
      '<div class="container">' +
        '<div class="section-head reveal">' +
          '<p class="eyebrow"><span class="eyebrow__num">02</span><span class="eyebrow__line"></span><span class="eyebrow__text">Design points</span></p>' +
          '<h2 class="h2" id="d-points">設計のポイント</h2>' +
        '</div>' +
        '<ol class="points">' +
          w.points.map(function (p, i) {
            return '<li class="point reveal" data-delay="' + i + '"><p class="point__no">0' + (i + 1) + '</p><h3 class="h3">' + esc(p.title) + '</h3><p>' + esc(p.text) + '</p></li>';
          }).join("") +
        '</ol>' +
      '</div>' +
    '</section>' +

    /* --- ビフォー・アフター --- */
    '<section class="section bg-concrete is-dark" aria-labelledby="d-ba">' +
      '<div class="container grid-12 compare-wrap' + (w.images.before ? "" : " compare-wrap--text") + '">' +
        '<div class="compare-wrap__text reveal">' +
          '<p class="eyebrow"><span class="eyebrow__num">03</span><span class="eyebrow__line"></span><span class="eyebrow__text">Before / After</span></p>' +
          '<h2 class="h2" id="d-ba">空間の変化</h2>' +
          '<dl class="ba-list">' +
            '<div><dt lang="en">Before</dt><dd>' + esc(w.before) + '</dd></div>' +
            '<div><dt lang="en">After</dt><dd>' + esc(w.after) + '</dd></div>' +
          '</dl>' +
        '</div>' +
        // 改修前の写真があるときだけ、比較スライダーを出す
        (w.images.before ?
        '<div class="compare-wrap__view reveal" data-delay="1">' +
          '<div class="compare" data-compare>' +
            '<div class="media compare__after">' + ui.img(w.images.main, w.alt.main, { sizes: "(max-width: 899px) 100vw, 58vw" }) + '</div>' +
            '<div class="media compare__before">' + ui.img(w.images.before, w.alt.before, { sizes: "(max-width: 899px) 100vw, 58vw" }) + '</div>' +
            '<span class="compare__label compare__label--before" lang="en">Before</span>' +
            '<span class="compare__label compare__label--after" lang="en">After</span>' +
            '<input class="compare__range" type="range" min="0" max="100" value="50" step="1" aria-label="改修前と改修後の写真の比較。左右に動かして見比べます" data-compare-range>' +
            '<span class="compare__handle" aria-hidden="true"></span>' +
          '</div>' +
          '<p class="compare-note small muted">中央のつまみを左右に動かすと、改修前（左）と改修後（右）を見比べられます。キーボードの ← → でも操作できます。</p>' +
        '</div>' : "") +
      '</div>' +
    '</section>' +

    /* --- 写真ギャラリー（写真がない事例では出さない） --- */
    (GALLERY.length ?
    '<section class="section bg-white" aria-labelledby="d-gallery">' +
      '<div class="container">' +
        '<div class="section-head section-head--spaced reveal">' +
          '<p class="eyebrow"><span class="eyebrow__num">04</span><span class="eyebrow__line"></span><span class="eyebrow__text">Gallery</span></p>' +
          '<h2 class="h2" id="d-gallery">写真ギャラリー</h2>' +
          '<p class="muted small">写真を選ぶと、大きく表示されます。</p>' +
        '</div>' +
        '<div class="grid-12 gallery">' +
          GALLERY.map(function (g, k) { return galleryItem(k + 1, g.ratio, g.size, g.sizes); }).join("") +
        '</div>' +
      '</div>' +
    '</section>' : "") +

    /* --- 施工概要 --- */
    '<section class="section bg-plaster" aria-labelledby="d-outline">' +
      '<div class="container grid-12 profile-wrap">' +
        '<div class="profile-wrap__head reveal">' +
          '<p class="eyebrow"><span class="eyebrow__num">' + (GALLERY.length ? "05" : "04") + '</span><span class="eyebrow__line"></span><span class="eyebrow__text">Outline</span></p>' +
          '<h2 class="h2" id="d-outline">施工概要</h2>' +
        '</div>' +
        '<div class="profile-wrap__body reveal" data-delay="1">' +
          '<dl class="profile">' +
            '<div><dt>事例名</dt><dd>' + esc(w.title) + '</dd></div>' +
            '<div><dt>所在地</dt><dd>' + esc(w.place) + '</dd></div>' +
            '<div><dt>種別</dt><dd>' + esc(w.type) + '</dd></div>' +
            '<div><dt>面積</dt><dd>' + esc(w.size) + '</dd></div>' +
            '<div><dt>築年数</dt><dd>' + esc(w.age) + '（改修時）</dd></div>' +
            '<div><dt>期間</dt><dd>' + esc(w.period) + '</dd></div>' +
            '<div><dt>竣工</dt><dd>' + esc(w.year) + '年</dd></div>' +
          '</dl>' +
          '<p class="note">この施工事例はポートフォリオ用の架空の事例です。写真は AI で作成したイメージで、実在する建物ではありません。</p>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* --- 前後の事例・他の事例 --- */
    '<section class="section bg-white" aria-labelledby="d-more">' +
      '<div class="container">' +
        '<h2 class="visually-hidden" id="d-more">ほかの施工事例</h2>' +
        '<nav class="pager" aria-label="前後の施工事例">' +
          '<a href="works-detail.html?id=' + esc(prev.id) + '" rel="prev"><span class="label"><span class="arrow arrow--back" aria-hidden="true"></span>Prev</span><span class="pager__title" lang="en">' + esc(prev.title) + '</span></a>' +
          '<a href="works-detail.html?id=' + esc(next.id) + '" rel="next"><span class="label">Next<span class="arrow" aria-hidden="true"></span></span><span class="pager__title" lang="en">' + esc(next.title) + '</span></a>' +
        '</nav>' +
        '<div class="others">' +
          '<div class="top-works__head">' +
            '<p class="eyebrow"><span class="eyebrow__text">Other works</span><span class="eyebrow__line"></span></p>' +
            '<a class="link-arrow" href="works.html">施工事例の一覧へ<span class="arrow" aria-hidden="true"></span></a>' +
          '</div>' +
          '<div class="others__list">' +
            others.map(function (o) { return ui.workCard(o, { sizes: "(max-width: 767px) 100vw, 30vw" }); }).join("") +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* --- お問い合わせ --- */
    '<section class="section bg-concrete is-dark cta-band" aria-labelledby="d-cta">' +
      '<div class="container grid-12 cta-band__grid">' +
        '<div class="cta-band__text reveal">' +
          '<p class="eyebrow"><span class="eyebrow__text">Contact</span><span class="eyebrow__line"></span></p>' +
          '<h2 class="h1" id="d-cta"><span class="ph">このような住まいを、</span><span class="ph">あなたの場所でも。</span></h2>' +
          '<p class="muted">事例を見て気になったことを、そのままお聞かせください（デモのため、実際には送信されません）。</p>' +
        '</div>' +
        '<div class="cta-band__actions reveal" data-delay="1">' +
          '<a class="btn btn--light" href="contact.html"><span>この事例について相談する（デモ）</span><span class="arrow" aria-hidden="true"></span></a>' +
          '<a class="btn btn--ghost" href="works.html"><span>施工事例の一覧へ</span><span class="arrow" aria-hidden="true"></span></a>' +
        '</div>' +
      '</div>' +
    '</section>';

  R.observeReveal(main);

  /* ---------- 2. ビフォー・アフター ---------- */
  var compare = main.querySelector("[data-compare]");
  var range = main.querySelector("[data-compare-range]");
  if (compare && range) {
    var setPos = function () {
      compare.style.setProperty("--pos", range.value + "%");
      range.setAttribute("aria-valuetext", "改修前を" + range.value + "%表示");
    };
    range.addEventListener("input", setPos);
    setPos();
  }

  /* ---------- 3. ライトボックス ---------- */
  var lb = document.querySelector("[data-lightbox]");
  if (!lb || typeof lb.showModal !== "function") {
    // <dialog> に対応していない古いブラウザでは、写真を新しいタブで開く
    main.addEventListener("click", function (e) {
      var b = e.target.closest("[data-open]");
      if (b) window.open("assets/images/" + photos[+b.getAttribute("data-open")].name + ".jpg", "_blank", "noopener");
    });
    return;
  }

  var lbImg = lb.querySelector("[data-lb-img]");
  var lbCap = lb.querySelector("[data-lb-caption]");
  var lbCount = lb.querySelector("[data-lb-count]");
  var current = 0;
  var opener = null;

  function show(i) {
    current = (i + photos.length) % photos.length;
    var p = photos[current];
    lbImg.src = "assets/images/" + p.name + ".jpg";
    lbImg.alt = p.alt;
    lbCap.textContent = p.cap;
    lbCount.textContent = (current + 1) + " / " + photos.length;
  }

  function open(i, trigger) {
    opener = trigger || null;
    show(i);
    lb.showModal();
    document.body.classList.add("is-locked");
    lb.querySelector("[data-lb-close]").focus();
  }

  function close() {
    if (lb.open) lb.close();
  }

  lb.addEventListener("close", function () {
    document.body.classList.remove("is-locked");
    if (opener) opener.focus();
  });

  main.addEventListener("click", function (e) {
    var b = e.target.closest("[data-open]");
    if (b) open(+b.getAttribute("data-open"), b);
  });

  lb.querySelector("[data-lb-close]").addEventListener("click", close);
  lb.querySelector("[data-lb-prev]").addEventListener("click", function () { show(current - 1); });
  lb.querySelector("[data-lb-next]").addEventListener("click", function () { show(current + 1); });

  // 写真の外側（暗い部分）をタップすると閉じる
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target === lb.querySelector("[data-lb-stage]") || e.target === lbCap) close();
  });

  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
  });

  // スワイプ：左右で前後の写真、下へ大きく動かすと閉じる
  var sx = 0, sy = 0, tracking = false;
  lb.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  });
})();
