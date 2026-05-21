/**
 * Stripe Payment Link をCTAボタンに差し込む。
 *
 * 優先順位:
 *   1. window.KDP_FACTORY_CONFIG (config.js / ビルド時に env から生成)
 *   2. index.html 内のプレースホルダ __STRIPE_PAYMENT_LINK_*__
 *
 * いずれも未設定の場合は CTA を「準備中」表示にしてクリックを無効化する。
 */
(function () {
  "use strict";

  var config = window.KDP_FACTORY_CONFIG || {};

  var PLACEHOLDER = {
    individual: "__STRIPE_PAYMENT_LINK_INDIVIDUAL__",
    corporate: "__STRIPE_PAYMENT_LINK_CORPORATE__",
  };

  var CONFIG_KEY = {
    individual: "stripePaymentLinkIndividual",
    corporate: "stripePaymentLinkCorporate",
  };

  function resolveLink(plan) {
    var fromConfig = config[CONFIG_KEY[plan]];
    if (fromConfig && /^https?:\/\//.test(fromConfig)) {
      return fromConfig;
    }
    return null; // プレースホルダのまま = 未設定
  }

  ["individual", "corporate"].forEach(function (plan) {
    var btn = document.getElementById("cta-" + plan);
    if (!btn) return;

    var link = resolveLink(plan);

    if (link) {
      btn.setAttribute("href", link);
      btn.setAttribute("rel", "noopener");
    } else {
      // 未設定: クリック無効化 + 視覚的に区別
      btn.classList.add("cta-unconfigured");
      btn.setAttribute("href", "#pricing");
      btn.setAttribute("aria-disabled", "true");
      btn.textContent = "準備中 (決済リンク未設定)";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        console.warn(
          "[kdp-factory] Stripe Payment Link (" +
            plan +
            ") が未設定です。config.js または HTML のプレースホルダを設定してください。"
        );
      });
    }
  });
})();
