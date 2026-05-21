# kdp-factory

Low-content KDP book generation pipeline.
See `claude-harness/proposals/passive-income/2026-05-13-architecture.md` (M+3 onwards).

## CLI

```
npm install
npx tsx src/cli.ts --help
```

## Landing page (外販 LP)

`landing/` に外販用の静的 LP があります。サービス説明・料金表
(個人 ¥2,980/月 / 法人 ¥9,800/月) と Stripe Payment Link への CTA を含みます。

### 設定 (Stripe Payment Link)

Stripe ダッシュボードで Payment Link を 2 本 (個人/法人) 作成し、URL を env var に設定します。

| env var | 用途 |
| --- | --- |
| `STRIPE_PAYMENT_LINK_INDIVIDUAL` | 個人プラン (¥2,980/月) の Payment Link URL |
| `STRIPE_PAYMENT_LINK_CORPORATE`  | 法人プラン (¥9,800/月) の Payment Link URL |

`.env.example` を参照。これらは公開 URL でありシークレットではありませんが、
環境ごとに差し替えるため env で管理します。**API キー等の秘密はコードに書かないこと。**

### ローカル確認

```
STRIPE_PAYMENT_LINK_INDIVIDUAL=https://buy.stripe.com/... \
STRIPE_PAYMENT_LINK_CORPORATE=https://buy.stripe.com/... \
node landing/build-config.js
# landing/ を任意の静的サーバで配信
npx serve landing
```

env 未設定でも LP は表示でき、CTA は「準備中」表示になります。

### Vercel デプロイ

`landing/` を Root Directory に指定してインポートします
(`landing/vercel.json` が Build Command `node build-config.js` を定義済)。
Vercel の Project Settings → Environment Variables に上記 2 つの
env var を登録すると、ビルド時に `landing/config.js` が生成され CTA が有効化されます。
