// NOVA AI：AI 文章作成画面の動き
// 1. AI の接続状態を確認して表示する（/api/status）
// 2. 文章の種類に合わせて、入力欄の説明・文字数・出力形式を切りかえる
// 3. 入力チェック（サーバーでも同じチェックをしています）
// 4. 結果欄の状態表示（未作成・作成中・エラー・お知らせ・完成）を1か所で切りかえる
// 5. 文章を作る（/api/generate）・中止・エラーの表示
// 6. 作成結果の編集・コピー・もう一度作る・条件を変える
// 7. 入力例とサンプル文章（AI が作ったものではない見本）
//
// ・APIキーはこのファイルにもページにも含みません。AI の呼び出しはサーバーが行います。
// ・サーバーから返った文章は textContent / value でだけ表示します（HTML として解釈しない）。
// ・結果の出どころは3種類：本物の AI（ai）／確認用の模擬AI（mock）／見本（sample）。表示を必ず分けます。
// ・<meta name="nova-mode" content="demo"> があるページ（ポートフォリオ掲載用のデモ）では、
//   サーバーに一切問い合わせず、サンプル文章だけを見せる「デモモード」で動きます。
(function () {
  "use strict";

  var form = document.querySelector("[data-studio-form]");
  if (!form) return;
  var DEMO = !!document.querySelector('meta[name="nova-mode"][content="demo"]');

  // ---------- 文章の種類ごとの設定（サーバーの src/validate.js と同じ値） ----------
  var TYPES = {
    sns: {
      label: "SNS投稿文",
      detailsLabel: "特徴・伝えたいこと",
      detailsPlaceholder: "例：10月末までの期間限定。甘さ控えめ。テイクアウトもできます。",
      preview: "Instagram などにそのまま貼れる投稿文を作ります。改行や絵文字も控えめに整えます。",
      formats: [["caption_hashtags", "本文＋ハッシュタグ"], ["caption_only", "本文のみ"]],
      lengths: { short: "短め（100字）", standard: "標準（200字）", long: "長め（400字）" },
    },
    product: {
      label: "商品・サービス紹介文",
      detailsLabel: "特徴・伝えたいこと",
      detailsPlaceholder: "例：素材や作り方のこだわり、使う場面、価格、サイズや色の種類など",
      preview: "ホームページやチラシに載せられる紹介文を作ります。箇条書きの形式も選べます。",
      formats: [["paragraph", "文章"], ["bullets", "箇条書き＋文章"]],
      lengths: { short: "短め（150字）", standard: "標準（300字）", long: "長め（600字）" },
    },
    email: {
      label: "営業メール・問い合わせ返信文",
      detailsLabel: "伝えたい内容（返信なら、問い合わせの内容と回答）",
      detailsPlaceholder: "例：問い合わせ「11月に30名のイベントで軽食を頼めるか」→ 回答「対応できる。メニューは3種類」",
      preview: "件名つきのメール文を作ります。宛名と署名は［ ］の空欄にするので、書き足して使えます。",
      formats: [["sales", "新規の営業メール"], ["reply", "問い合わせへの返信"]],
      lengths: { short: "短め（200字）", standard: "標準（400字）", long: "長め（700字）" },
    },
    lp: {
      label: "LPの構成・コピー",
      detailsLabel: "特徴・伝えたいこと",
      detailsPlaceholder: "例：だれの、どんな悩みを解決するか。サービスの特徴、料金の考え方、申し込み方法など",
      preview: "ランディングページのセクション構成と、見出し・文章の案を作ります。",
      formats: [["outline", "構成案"], ["full", "構成＋コピー"]],
      lengths: { short: "短め（4セクション）", standard: "標準（6セクション）", long: "長め（8セクション）" },
    },
  };

  var TONE_LABELS = {
    friendly: "親しみやすい",
    polite: "丁寧・誠実",
    elegant: "上品・落ち着いた",
    casual: "元気・カジュアル",
    professional: "専門的・信頼感",
  };

  var LIMITS = {
    productName: { min: 1, max: 60 },
    details: { min: 10, max: 1000 },
    audience: { min: 0, max: 100 },
  };

  // 入力例（架空の商品です）
  var EXAMPLES = {
    sns: {
      productName: "（例）秋限定 和栗のモンブランタルト",
      details: "10月末までの期間限定。熊本県産の和栗を使用。甘さ控えめ。イートインとテイクアウトどちらも可。1日20個限定。",
      audience: "近所に住む30〜40代の方",
      tone: "friendly", length: "standard", format: "caption_hashtags",
    },
    product: {
      productName: "（例）手縫いの革の名刺入れ",
      details: "職人が一つずつ手縫いで仕上げる名刺入れ。国産の牛革を使用。使うほど色が深まる。名入れ刻印を無料で受付。カラーはキャメル・ネイビー・ブラックの3色。",
      audience: "初めて名刺を持つ新社会人と、そのプレゼントを探す家族",
      tone: "elegant", length: "standard", format: "paragraph",
    },
    email: {
      productName: "（例）カフェのケータリング",
      details: "問い合わせ：11月中旬に30名の社内イベントで軽食を頼めるか。回答：対応できる。メニューは3種類から選べる。日程と人数が決まったら見積もりを送る。",
      audience: "社内イベントの担当者",
      tone: "polite", length: "standard", format: "reply",
    },
    lp: {
      productName: "（例）小さなお店のホームページ制作",
      details: "飲食店・小売店向け。スマホで見やすいデザイン。写真の撮り方のアドバイス付き。公開後の更新方法もわかりやすく説明する。料金は内容に合わせて見積もり。",
      audience: "ホームページを初めて作る個人店のオーナー",
      tone: "friendly", length: "standard", format: "outline",
    },
  };

  // サンプル文章（Nook Design が用意した見本。AI が作ったものではありません）
  var SAMPLES = {
    sns:
      "🌰 秋限定「和栗のモンブランタルト」はじまりました\n\n" +
      "熊本県産の和栗を使った、甘さ控えめのモンブランタルト。\nひと口目から、栗のやさしい香りが広がります。\n\n" +
      "イートインでもテイクアウトでもどうぞ。\n1日20個限定、10月末までの期間限定です。\nお散歩のついでに、ぜひ立ち寄ってみてくださいね。\n\n" +
      "［店名］［営業時間］\n\n#和栗 #モンブラン #モンブランタルト #秋スイーツ #期間限定 #テイクアウト #カフェ",
    product:
      "職人がひと針ずつ手縫いで仕上げた、国産牛革の名刺入れです。\n\n" +
      "しっとりとした革は、使うほどに色が深まり、持つ人の時間とともに表情を変えていきます。" +
      "カラーは、やわらかなキャメル、落ち着いたネイビー、引き締まったブラックの3色。" +
      "名入れの刻印は無料で承ります。\n\n" +
      "はじめての名刺を持つ方へ、そして大切な人への贈りものに。長く寄り添う一つを選んでみませんか。\n\n［価格］［ご注文方法］",
    email:
      "件名：Re: ケータリングのご相談について\n\n［お相手のお名前］様\n\n" +
      "このたびはお問い合わせいただき、ありがとうございます。\n" +
      "11月中旬に予定されている30名さまの社内イベントでの軽食について、ご用意いたします。\n\n" +
      "メニューは3種類からお選びいただけます。内容は［メニューの案内先］をご覧ください。\n" +
      "日程と人数が決まりましたら、お知らせいただけますでしょうか。あらためてお見積もりをお送りいたします。\n\n" +
      "当日がよい時間になりますよう、心を込めて準備いたします。\nどうぞよろしくお願いいたします。\n\n［署名］",
    lp:
      "【ファーストビュー】\n目的：だれのためのサービスかを一目で伝える\n・見出し案：はじめてのホームページを、お店らしく。\n・スマホで見たときの完成イメージの写真\n・ボタン：まずは相談してみる\n\n" +
      "【こんなお悩みはありませんか】\n目的：読み手が「自分のことだ」と感じる\n・何から準備すればいいかわからない\n・作ったあとの更新が不安\n\n" +
      "【できること】\n目的：サービスの内容を具体的に伝える\n・スマホで見やすいデザイン\n・写真の撮り方のアドバイス\n・公開後の更新方法の説明\n\n" +
      "【料金の考え方】\n目的：費用の不安を減らす\n・内容に合わせてお見積もり［目安の金額］\n\n" +
      "【制作の流れ】\n目的：相談から公開までを見通せるようにする\n・相談 → お見積もり → 制作 → 確認 → 公開\n\n" +
      "【お問い合わせ】\n目的：最初の一歩を軽くする\n・ボタン：無料で相談する\n・返信までの目安［日数］",
  };

  // 接続状態：短い表示（ai-status）と、必要なときの説明（notice）
  var STATUS = {
    checking: { pill: "確認中…" },
    ready: { pill: "AI 接続中" },
    mock: {
      pill: "模擬AI（テスト用）",
      tone: "info",
      title: "確認用の「模擬AI」で動いています",
      text: "作成ボタンを押すと、決まった確認用の文章が返ります。本物の AI の文章ではありません。",
    },
    not_configured: {
      pill: "AI 準備中",
      tone: "warning",
      title: "AI 機能は準備中です",
      text: "接続の設定が終わると使えるようになります。それまでは、種類ごとのサンプル文章をご覧いただけます。",
    },
    unavailable: {
      pill: "AI 一時停止中",
      tone: "warning",
      title: "AI 機能を一時停止しています",
      text: "時間をおいてお試しください。サンプル文章はご覧いただけます。",
    },
    demo: {
      pill: "デモ（AI 接続なし）",
      tone: "info",
      title: "このページは画面デザインのプロトタイプです",
      text: "AI には接続していないため、文章は作成できません。入力した内容はどこにも送信されません。種類ごとのサンプル文章で、仕上がりのイメージをご覧ください。",
    },
    offline: {
      pill: "AI 利用不可",
      tone: "warning",
      title: "このページでは AI 機能を使えません",
      text: "AI のサーバーがない場所で公開されているページです。サンプル文章はご覧いただけます。",
    },
    limited: {
      pill: "本日の上限",
      tone: "warning",
      title: "本日の無料作成回数を使い切りました",
      text: "日本時間の0時を過ぎると、また作成できます。",
    },
  };

  var $ = function (sel) { return document.querySelector(sel); };
  var el = {
    status: $("[data-ai-status]"),
    statusText: $("[data-ai-status-text]"),
    notice: $("[data-ai-notice]"),
    noticeTitle: $("[data-ai-notice-title]"),
    noticeText: $("[data-ai-notice-text]"),
    setup: $("[data-ai-setup]"),
    detailsLabel: $("[data-details-label]"),
    details: form.elements.details,
    lengthChips: $('[data-chips="length"]'),
    formatChips: $('[data-chips="format"]'),
    submit: $("[data-generate]"),
    submitLabel: $("[data-generate-label]"),
    meta: $("[data-actionbar-meta]"),
    fillExample: $("[data-fill-example]"),
    result: $("[data-result]"),
    badge: $("[data-result-badge]"),
    stateBox: $("[data-state-box]"),
    stateIcon: $("[data-state-icon]"),
    stateTitle: $("[data-state-title]"),
    stateText: $("[data-state-text]"),
    stateActions: $("[data-state-actions]"),
    body: $("[data-result-body]"),
    summary: $("[data-result-summary]"),
    label: $("[data-result-label]"),
    text: $("[data-result-text]"),
    count: $("[data-result-count]"),
    remaining: $("[data-result-remaining]"),
    copy: $("[data-copy]"),
    copyLabel: $("[data-copy-label]"),
    regenerate: $("[data-regenerate]"),
    editConditions: $("[data-edit-conditions]"),
    live: $("[data-live]"),
  };

  var state = {
    ai: "checking",
    remaining: null,
    busy: false,
    controller: null,
    canceled: false,
    timer: null,
    lastPayload: null, // 最後に AI で作ったときの入力（「もう一度作る」で使う）
    generatedText: "", // 編集されたかどうかの判定用
  };

  function chars(str) {
    return Array.from(str).length;
  }

  function announce(message) {
    el.live.textContent = "";
    setTimeout(function () { el.live.textContent = message; }, 50);
  }

  function radioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function setRadio(name, value) {
    var input = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (input) input.checked = true;
  }

  // ---------- 1. AI の接続状態 ----------
  function setStatus(ai, remaining) {
    if ((ai === "ready" || ai === "mock") && remaining === 0) ai = "limited";
    state.ai = ai;
    if (typeof remaining === "number") state.remaining = remaining;
    var info = STATUS[ai] || STATUS.unavailable;
    el.status.setAttribute("data-state", ai);
    var pill = info.pill;
    if ((ai === "ready" || ai === "mock") && typeof state.remaining === "number") pill += "・あと" + state.remaining + "回";
    el.statusText.textContent = pill;

    el.notice.hidden = !info.title;
    if (info.title) {
      el.notice.setAttribute("data-tone", info.tone);
      el.noticeTitle.textContent = info.title;
      el.noticeText.textContent = info.text;
    }
    el.setup.hidden = ai !== "not_configured";
    el.meta.textContent = typeof state.remaining === "number" && (ai === "ready" || ai === "mock") ? "本日あと " + state.remaining + " 回作れます" : "";
    if (el.result.getAttribute("data-state") === "empty") renderEmpty();
  }

  function fetchWithTimeout(url, options, ms) {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, ms) : null;
    var opts = Object.assign({}, options, controller ? { signal: controller.signal } : {});
    var promise = fetch(url, opts).finally(function () { if (timer) clearTimeout(timer); });
    promise.controller = controller;
    return promise;
  }

  // サーバーの返事を読む。JSON でなければ「AI のサーバーがない場所」と判断する
  function readJson(response) {
    var type = response.headers.get("content-type") || "";
    if (type.indexOf("application/json") === -1) return Promise.reject(new Error("offline"));
    return response.json();
  }

  function checkStatus() {
    if (DEMO) {
      setStatus("demo");
      return;
    }
    if (location.protocol === "file:") {
      setStatus("offline");
      return;
    }
    fetchWithTimeout("api/status", { headers: { accept: "application/json" }, cache: "no-store" }, 10000)
      .then(readJson)
      .then(function (data) {
        if (!data || data.ok !== true) throw new Error("bad");
        var ai = data.ai === "ready" && data.mode === "mock" ? "mock" : data.ai;
        setStatus(ai, data.remainingToday);
      })
      .catch(function () { setStatus("offline"); });
  }

  // ---------- 2. 種類に合わせて入力欄を切りかえる ----------
  function fillChips(container, name, entries, keepValue) {
    var previous = radioValue(name);
    while (container.firstChild) container.removeChild(container.firstChild);
    entries.forEach(function (entry, i) {
      var label = document.createElement("label");
      label.className = "chip";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = entry[0];
      var span = document.createElement("span");
      span.textContent = entry[1];
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
      if (i === 0) input.checked = true;
    });
    if (keepValue && previous) setRadio(name, previous);
  }

  function applyType() {
    var cfg = TYPES[radioValue("type") || "sns"];
    el.detailsLabel.textContent = cfg.detailsLabel;
    el.details.placeholder = cfg.detailsPlaceholder;
    fillChips(el.formatChips, "format", cfg.formats, false);
    var hadLength = radioValue("length");
    fillChips(el.lengthChips, "length", ["short", "standard", "long"].map(function (k) { return [k, cfg.lengths[k]]; }), true);
    if (!hadLength) setRadio("length", "standard");
    if (el.result.getAttribute("data-state") === "empty") renderEmpty();
  }

  form.addEventListener("change", function (e) {
    if (e.target.name === "type") applyType();
  });

  // ---------- 3. 入力チェック ----------
  function updateCount(input) {
    var counter = $('[data-count-for="' + input.id + '"]');
    if (!counter) return;
    var len = chars(input.value);
    var max = LIMITS[input.name].max;
    counter.textContent = len + " / " + max;
    counter.classList.toggle("is-over", len > max);
  }

  ["productName", "details", "audience"].forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener("input", function () {
      updateCount(input);
      if (input.getAttribute("aria-invalid") === "true") setFieldError(name, "");
    });
    updateCount(input);
  });

  // 内容の欄で Ctrl（Mac は ⌘）＋ Enter を押すと作成する
  el.details.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else el.submit.click();
    }
  });

  function setFieldError(name, message) {
    var input = form.elements[name];
    var box = form.querySelector('[data-error-for="' + name + '"]');
    if (box) box.textContent = message;
    if (input && input.setAttribute) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function collect() {
    return {
      type: radioValue("type"),
      productName: form.elements.productName.value.trim(),
      details: form.elements.details.value.trim(),
      audience: form.elements.audience.value.trim(),
      tone: radioValue("tone"),
      length: radioValue("length"),
      format: radioValue("format"),
    };
  }

  function validate(payload) {
    var errors = {};
    Object.keys(LIMITS).forEach(function (name) {
      var len = chars(payload[name]);
      var rule = LIMITS[name];
      if (len < rule.min) errors[name] = rule.min <= 1 ? "入力してください。" : rule.min + "文字以上で入力してください。";
      else if (len > rule.max) errors[name] = rule.max + "文字以内で入力してください（いま" + len + "文字）。";
    });
    return errors;
  }

  function showFieldErrors(errors) {
    var first = null;
    Object.keys(LIMITS).forEach(function (name) {
      setFieldError(name, errors[name] || "");
      if (errors[name] && !first) first = form.elements[name];
    });
    if (first) first.focus();
    return !!first;
  }

  // ---------- 4. 結果欄の状態表示 ----------
  // part：empty（未作成）・loading（作成中）・error（エラー）・notice（お知らせ）・body（完成）
  function show(part) {
    el.result.setAttribute("data-state", part);
    el.stateBox.hidden = part === "body";
    el.body.hidden = part !== "body";
    if (part !== "body") el.badge.hidden = true;
  }

  function button(label, className, onClick, attr) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn--sm " + className;
    b.textContent = label;
    if (attr) b.setAttribute(attr, "");
    b.addEventListener("click", onClick);
    return b;
  }

  // 状態の箱の中身をまとめて差しかえる（tone：neutral / progress / info / warning / error）
  function renderState(part, tone, icon, title, text, actions) {
    show(part);
    el.stateBox.setAttribute("data-tone", tone);
    el.stateIcon.firstElementChild.setAttribute("href", "#" + icon);
    el.stateTitle.textContent = title;
    el.stateText.textContent = text;
    while (el.stateActions.firstChild) el.stateActions.removeChild(el.stateActions.firstChild);
    (actions || []).forEach(function (a) { el.stateActions.appendChild(a); });
  }

  function sampleButton(primary) {
    return button("サンプル文章を見る", primary ? "btn--primary" : "btn--ghost", showSample, "data-show-sample");
  }

  function renderEmpty() {
    var cfg = TYPES[radioValue("type") || "sns"];
    var usable = state.ai === "ready" || state.ai === "mock";
    renderState(
      "empty",
      "neutral",
      "i-spark",
      "ここに「" + cfg.label + "」が表示されます",
      cfg.preview + (usable ? "左の条件を入力して「AIで文章を作る」を押してください。" : ""),
      [sampleButton(!usable && state.ai !== "checking")]
    );
  }

  function startTimer() {
    var started = Date.now();
    var base = "ふつうは10〜30秒ほどで完成します。";
    el.stateText.textContent = base;
    state.timer = setInterval(function () {
      var sec = Math.round((Date.now() - started) / 1000);
      el.stateText.textContent = base + "（" + sec + "秒経過）";
    }, 1000);
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function renderLoading() {
    renderState("loading", "progress", "i-spark", "AI が文章を作成しています", "", [
      button("中止する", "btn--ghost", cancel, "data-cancel"),
    ]);
    startTimer();
  }

  // ---------- 5. 文章を作る ----------
  var ERROR_TEXT = {
    offline: "AI のサーバーにつながりませんでした。インターネット接続を確認するか、時間をおいてお試しください。",
    timeout: "AI の応答に時間がかかりすぎたため、中断しました。もう一度お試しください。",
    unknown: "エラーが発生しました。時間をおいてお試しください。",
  };
  // もう一度試せば直る可能性があるエラー
  var RETRYABLE = ["upstream_timeout", "upstream_unavailable", "upstream_rate_limited", "empty_response", "internal_error", "timeout", "network"];
  // AI を使えない状態（サンプルへ案内する）
  var NO_AI = ["not_configured", "limiter_unavailable", "client_daily", "total_daily", "offline", "upstream_spend_limit", "upstream_billing", "upstream_auth"];
  // サービス側の設定や上限で止まっている状態（このあとも使えないので、接続状態を「一時停止中」にする）
  var PAUSED = ["upstream_spend_limit", "upstream_billing", "upstream_auth", "limiter_unavailable"];

  function renderError(code, message) {
    var actions = [];
    var tone = "error";
    var title = "文章を作成できませんでした";
    if (NO_AI.indexOf(code) !== -1) {
      tone = "warning";
      title = code === "client_daily" || code === "total_daily" ? "本日の上限に達しました" : "いまは AI を使えません";
      actions.push(sampleButton(true));
    } else if (code === "client_minute") {
      tone = "warning";
      title = "少し待ってからお試しください";
    } else if (RETRYABLE.indexOf(code) !== -1 && state.pendingPayload) {
      actions.push(button("もう一度試す", "btn--primary", function () { generate(state.pendingPayload); }, "data-retry"));
    } else if (code === "refused" || code === "upstream_bad_request") {
      actions.push(button("条件を変える", "btn--ghost", focusConditions));
    }
    renderState("error", tone, tone === "error" ? "i-minus" : "i-clock", title, message, actions);
    announce(title + "。" + message);
  }

  function setBusy(busy) {
    state.busy = busy;
    el.submit.disabled = busy;
    el.regenerate.disabled = busy;
    el.submit.classList.toggle("is-loading", busy);
    el.submitLabel.textContent = busy ? "作成しています…" : "AIで文章を作る";
    form.setAttribute("aria-busy", String(busy));
    el.result.setAttribute("aria-busy", String(busy));
  }

  function summaryOf(payload) {
    var cfg = TYPES[payload.type];
    if (!payload.tone) return cfg.label;
    var format = cfg.formats.filter(function (f) { return f[0] === payload.format; })[0];
    return [cfg.label, TONE_LABELS[payload.tone], cfg.lengths[payload.length], format ? format[1] : ""].filter(Boolean).join(" ・ ");
  }

  var SOURCE = {
    ai: { badge: "AI が作成", label: "AI が作成した下書きです。自由に編集できます。" },
    mock: { badge: "模擬AI（テスト用）", label: "確認用の模擬AIが返した決まった文章です。本物の AI の文章ではありません。" },
    sample: { badge: "サンプル", label: "Nook Design が用意した見本です。AI が作ったものではありません。" },
  };

  function showText(text, source, payload) {
    var info = SOURCE[source];
    show("body");
    el.badge.hidden = false;
    el.badge.className = "result__badge result__badge--" + source;
    el.badge.textContent = info.badge;
    el.result.setAttribute("data-source", source);
    el.summary.textContent = summaryOf(payload);
    el.label.textContent = info.label;
    el.text.value = text;
    state.generatedText = text;
    el.regenerate.hidden = source === "sample";
    updateResultCount();
    autoResize();
  }

  var wideQuery = window.matchMedia("(min-width: 1080px)");

  function scrollToResult() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var behavior = reduce ? "auto" : "smooth";
    if (wideQuery.matches) {
      // PC：結果欄は画面に追従するが、条件欄の下の端まで来ると上に押し出される。
      // 結果欄が全部見えるだけの余白ができるよう、ページを少し上に戻す
      var header = document.querySelector("[data-header]");
      var needed = (header ? header.offsetHeight : 72) + el.result.offsetHeight + 40;
      var formBottom = form.getBoundingClientRect().bottom;
      if (formBottom < needed) window.scrollBy({ top: formBottom - needed, behavior: behavior });
      return;
    }
    var rect = el.result.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight * 0.5) {
      el.result.scrollIntoView({ behavior: behavior, block: "start" });
    }
  }

  function cancel() {
    if (state.controller) {
      state.canceled = true;
      state.controller.abort();
    }
  }

  function generate(payload) {
    if (state.busy) return;
    state.pendingPayload = payload;
    state.canceled = false;
    setBusy(true);
    renderLoading();
    scrollToResult();
    announce("AI が文章を作成しています。");

    var request = fetchWithTimeout(
      "api/generate",
      {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
      100000
    );
    state.controller = request.controller;

    request
      .then(function (response) {
        return readJson(response).then(function (data) {
          return { status: response.status, data: data };
        });
      })
      .then(function (res) {
        var data = res.data || {};
        if (data.ok && typeof data.text === "string") {
          state.lastPayload = payload;
          var source = data.source === "mock" ? "mock" : "ai";
          showText(data.text, source, payload);
          el.remaining.textContent = "";
          if (typeof data.remainingToday === "number") {
            setStatus(source === "mock" ? "mock" : "ready", data.remainingToday);
            el.remaining.textContent = "本日あと " + data.remainingToday + " 回";
          }
          if (data.truncated) el.remaining.textContent += "・文章が長いため、途中で終わっている可能性があります";
          scrollToResult();
          announce("文章ができました。作成結果の欄で編集できます。");
          return;
        }
        var err = data.error || {};
        var message = typeof err.message === "string" ? err.message : ERROR_TEXT.unknown;
        if (err.code === "invalid_input" && err.fields) {
          // 入力欄のエラーは欄の下に、選択肢などのエラーはまとめて表示する
          var others = Object.keys(err.fields).filter(function (k) { return !LIMITS[k]; });
          if (showFieldErrors(err.fields) && !others.length) {
            if (state.generatedText) show("body");
            else renderEmpty();
            announce(message);
            return;
          }
          message += others.map(function (k) { return String(err.fields[k]); }).join(" ");
        }
        if (err.code === "not_configured") setStatus("not_configured");
        if (PAUSED.indexOf(err.code) !== -1) setStatus("unavailable");
        if (err.code === "client_daily" || err.code === "total_daily") setStatus(state.ai === "mock" ? "mock" : "ready", 0);
        renderError(err.code || "unknown", message);
      })
      .catch(function (error) {
        if (error && error.name === "AbortError") {
          if (state.canceled) {
            renderState("notice", "info", "i-clock", "作成を中止しました", "条件を見直して、もう一度お試しください。中止しても1回分として数えられる場合があります。", [
              button("もう一度作る", "btn--primary", function () { generate(payload); }, "data-retry"),
            ]);
            announce("作成を中止しました。");
          } else renderError("timeout", ERROR_TEXT.timeout);
        } else if (error && error.message === "offline") {
          setStatus("offline");
          renderError("offline", STATUS.offline.text);
        } else renderError("network", ERROR_TEXT.offline);
      })
      .finally(function () {
        stopTimer();
        state.controller = null;
        setBusy(false);
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var payload = collect();
    if (showFieldErrors(validate(payload))) {
      announce("入力内容を確認してください。");
      return;
    }
    // デモモードでは送信せず、サンプル文章へ案内する
    if (DEMO) {
      renderState("error", "warning", "i-clock", "このデモでは文章を作成できません", STATUS.demo.text, [sampleButton(true)]);
      announce("このデモでは文章を作成できません。サンプル文章をご覧ください。");
      return;
    }
    generate(payload);
  });

  // ---------- 6. 編集・コピー・もう一度作る・条件を変える ----------
  el.regenerate.addEventListener("click", function () {
    if (!state.lastPayload) return;
    if (el.text.value !== state.generatedText && !window.confirm("編集した文章は消えます。もう一度作りますか？")) return;
    generate(state.lastPayload);
  });

  function focusConditions() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setTimeout(function () { form.elements.productName.focus({ preventScroll: true }); }, reduce ? 0 : 400);
  }
  el.editConditions.addEventListener("click", focusConditions);

  function updateResultCount() {
    el.count.textContent = chars(el.text.value) + "文字";
  }

  function autoResize() {
    el.text.style.height = "auto";
    el.text.style.height = Math.min(el.text.scrollHeight + 4, 760) + "px";
  }

  el.text.addEventListener("input", function () {
    updateResultCount();
    autoResize();
  });

  function copied(ok) {
    el.copyLabel.textContent = ok ? "コピーしました" : "コピーできませんでした";
    el.copy.classList.toggle("is-done", ok);
    announce(ok ? "文章をコピーしました。" : "コピーできませんでした。文章を選んでコピーしてください。");
    setTimeout(function () {
      el.copyLabel.textContent = "コピー";
      el.copy.classList.remove("is-done");
    }, 2000);
  }

  el.copy.addEventListener("click", function () {
    var text = el.text.value;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { copied(true); }, fallbackCopy);
    } else fallbackCopy();

    // 古いブラウザ向け：文章を選択してコピーする
    function fallbackCopy() {
      el.text.focus();
      el.text.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      copied(ok);
    }
  });

  // ---------- 7. 入力例・サンプル ----------
  el.fillExample.addEventListener("click", function () {
    var ex = EXAMPLES[radioValue("type") || "sns"];
    form.elements.productName.value = ex.productName;
    form.elements.details.value = ex.details;
    form.elements.audience.value = ex.audience;
    setRadio("tone", ex.tone);
    setRadio("length", ex.length);
    setRadio("format", ex.format);
    ["productName", "details", "audience"].forEach(function (name) {
      updateCount(form.elements[name]);
      setFieldError(name, "");
    });
    announce("入力例を入れました。内容は自由に書きかえられます。");
  });

  function showSample() {
    var type = radioValue("type") || "sns";
    showText(SAMPLES[type], "sample", { type: type });
    el.remaining.textContent = "";
    scrollToResult();
    announce(TYPES[type].label + "のサンプル文章を表示しました。AI が作ったものではありません。");
  }

  // ---------- はじめに ----------
  applyType();
  setStatus("checking");
  checkStatus();
})();
