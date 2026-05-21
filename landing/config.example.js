/**
 * landing/config.js のサンプル。
 *
 * このファイルをコピーして config.js を作るか、
 * build-config.js が env から config.js を自動生成します。
 * config.js は .gitignore 済 (秘密ではないが環境依存値のため)。
 *
 * Stripe Payment Link の URL を貼り付けてください。
 */
window.KDP_FACTORY_CONFIG = {
  stripePaymentLinkIndividual: "https://buy.stripe.com/xxxxxxxxxxxx_individual",
  stripePaymentLinkCorporate: "https://buy.stripe.com/xxxxxxxxxxxx_corporate",
};
