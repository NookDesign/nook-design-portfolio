/* ==========================================================
   RENOVA｜お問い合わせフォーム（デモ）
   - 入力チェック → 確認画面 → 完了画面 の流れを再現する
   - 入力内容はどこにも送信・保存しない（fetch も localStorage も使わない）
   ========================================================== */
(function () {
  "use strict";

  var form = document.querySelector("[data-form]");
  if (!form) return;

  var esc = window.RENOVA.ui.esc;
  var confirmBox = document.querySelector("[data-confirm]");
  var doneBox = document.querySelector("[data-done]");
  var summary = form.querySelector("[data-error-summary]");
  var summaryList = form.querySelector("[data-error-list]");
  var steps = document.querySelectorAll("[data-step]");
  var count = form.querySelector("[data-count]");
  var submitBtn = form.querySelector("[data-to-confirm]");
  // 注意：form.name は「フォーム自体の名前」になるため、入力欄は form.elements.namedItem("name") で取り出す

  // JavaScript が動いているときだけ、確認ボタンを押せるようにする
  submitBtn.disabled = false;

  /* ---------- 入力チェックのルール ---------- */
  var RULES = {
    type: function (f) {
      return f.querySelector('input[name="type"]:checked') ? "" : "お問い合わせの種類を選んでください。";
    },
    name: function (f) {
      var v = f.elements.namedItem("name").value.trim();
      if (!v) return "お名前を入力してください。";
      return "";
    },
    email: function (f) {
      var v = f.email.value.trim();
      if (!v) return "メールアドレスを入力してください。";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "メールアドレスの形式が正しくありません。例：name@example.com";
      return "";
    },
    tel: function (f) {
      var v = f.tel.value.trim();
      if (!v) return "";
      var digits = v.replace(/[^0-9０-９]/g, "");
      if (!/^[0-9０-９\-－ ]+$/.test(v) || digits.length < 10 || digits.length > 11) return "電話番号は数字とハイフンで、10〜11桁で入力してください。";
      return "";
    },
    message: function (f) {
      var v = f.message.value.trim();
      if (!v) return "ご相談内容を入力してください。";
      if (v.length < 10) return "ご相談内容は10文字以上でご記入ください（いま" + v.length + "文字）。";
      return "";
    },
    agree: function (f) {
      return f.agree.checked ? "" : "個人情報の取り扱いへの同意にチェックを入れてください。";
    }
  };
  var LABELS = { type: "お問い合わせの種類", name: "お名前", email: "メールアドレス", tel: "電話番号", message: "ご相談内容", agree: "個人情報の取り扱い" };
  var FOCUS = { type: 'input[name="type"]', name: "#name", email: "#email", tel: "#tel", message: "#message", agree: "#agree" };

  function setError(key, msg) {
    var wrap = form.querySelector('[data-field="' + key + '"]');
    var out = wrap.querySelector("[data-error]");
    out.textContent = msg;
    var target = key === "type" ? wrap.querySelector(".choices") : form.querySelector(FOCUS[key]);
    if (msg) target.setAttribute("aria-invalid", "true");
    else target.removeAttribute("aria-invalid");
  }

  function check(key) {
    var msg = RULES[key](form);
    setError(key, msg);
    return msg;
  }

  // 入力欄から離れたときにチェック（一度エラーが出た欄は、入力のたびに再チェック）
  ["name", "email", "tel", "message"].forEach(function (key) {
    var el = form.querySelector(FOCUS[key]);
    el.addEventListener("blur", function () { if (el.value.trim() || key !== "tel") check(key); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) check(key); });
  });
  form.addEventListener("change", function (e) {
    if (e.target.name === "type") check("type");
    if (e.target.name === "agree") check("agree");
  });

  // 文字数カウンター
  function updateCount() {
    count.textContent = form.message.value.length + " / 1000文字";
  }
  form.message.addEventListener("input", updateCount);

  /* ---------- 画面の切りかえ ---------- */
  function setStep(name) {
    Array.prototype.forEach.call(steps, function (s) {
      if (s.getAttribute("data-step") === name) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });
    form.hidden = name !== "input";
    confirmBox.hidden = name !== "confirm";
    doneBox.hidden = name !== "done";
    var top = document.querySelector(".steps");
    var y = top.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: Math.max(0, y) });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();   // デモなので送信しない
    var errors = [];
    Object.keys(RULES).forEach(function (key) {
      var msg = check(key);
      if (msg) errors.push({ key: key, msg: msg });
    });

    if (errors.length) {
      summaryList.innerHTML = errors.map(function (er) {
        return '<li><a href="#' + (er.key === "type" ? "type" : er.key) + '" data-jump="' + er.key + '">' + esc(LABELS[er.key]) + "：" + esc(er.msg) + "</a></li>";
      }).join("");
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    // 確認画面に入力内容を表示（textContent で表示するので、HTML として解釈されない）
    var rows = [
      ["お問い合わせの種類", form.querySelector('input[name="type"]:checked').value],
      ["お名前", form.elements.namedItem("name").value.trim()],
      ["メールアドレス", form.email.value.trim()],
      ["電話番号", form.tel.value.trim() || "（未入力）"],
      ["ご相談内容", form.message.value.trim()],
      ["個人情報の取り扱い", "同意する"]
    ];
    var list = confirmBox.querySelector("[data-confirm-list]");
    list.innerHTML = "";
    rows.forEach(function (r) {
      var div = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = r[0];
      dd.textContent = r[1];
      div.appendChild(dt);
      div.appendChild(dd);
      list.appendChild(div);
    });
    setStep("confirm");
    confirmBox.focus();
  });

  // エラー一覧のリンクから、その入力欄へ移動
  summaryList.addEventListener("click", function (e) {
    var a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    var el = form.querySelector(FOCUS[a.getAttribute("data-jump")]);
    el.focus();
    el.scrollIntoView({ block: "center" });
  });

  confirmBox.querySelector("[data-back]").addEventListener("click", function () {
    setStep("input");
    form.elements.namedItem("name").focus();
  });

  confirmBox.querySelector("[data-send]").addEventListener("click", function () {
    // デモ：送信はせず、入力内容を消して完了画面へ
    form.reset();
    updateCount();
    confirmBox.querySelector("[data-confirm-list]").innerHTML = "";
    setStep("done");
    doneBox.focus();
  });

  doneBox.querySelector("[data-reset]").addEventListener("click", function () {
    Object.keys(RULES).forEach(function (key) { setError(key, ""); });
    setStep("input");
    form.querySelector('input[name="type"]').focus();
  });
})();
