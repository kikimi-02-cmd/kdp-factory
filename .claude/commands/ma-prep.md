---
description: M&A 売却準備パッケージ生成。CRO + CFO + CTO 並列召集。「売却」「Exit」「M&A準備」キーワードでも発火。
---

# /ma-prep (M&A準備) — 売却 due diligence パッケージ

## 引数

`/ma-prep <app_id>` 必須。app_id は `org.app_pipeline` に存在すること。

## 召集

CoS 経由で並列起動:
1. **CRO** — 概要 / pitch / segment / 競合
2. **CFO** — MRR / ARR / margin / 12 ヶ月推移 / valuation 推定
3. **CTO** — リポ構成 / コード品質 / 技術負債 / 引き継ぎ容易性

## 出力 format

```
## M&A 準備パッケージ <app_id> (YYYY-MM-DD)

### 概要 (CRO)
- 1行ピッチ
- ターゲット segment
- 競合 3 つ + 差別化

### 財務 (CFO)
- MRR ¥<n> / ARR ¥<n>
- gross margin <%>
- 過去 12 ヶ月推移グラフ用データ
- 推定 valuation: ¥<low> - ¥<high>  (multiple <x-y> × ARR)

### 技術 (CTO)
- リポ: <repo_url>
- LOC / コミット数 / 直近 90 日 active days
- 技術負債警告: <あれば>
- 引き継ぎ容易性: high/mid/low + 根拠
- 移管時の手順案

### 推奨価格レンジ
¥<low> - ¥<high>

### 次のステップ
1. 売却プラットフォーム選定（Acquire.com / FE / Indie Maker Acquire）
2. リスティング文面起草
3. 過去 12 ヶ月の数値証拠化
```

## State

- `org.app_pipeline` の対応 row を更新: `exit_candidate=true`, `valuation_estimate_jpy=<推定中央値>`
- `org.actions_log` に M&A準備実行ログを記録

## 失敗モード

- app_id 不在 → エラー終了、`/new-app` で登録を促す
- データ不足（MRR=null 等）→ 「<項目> がデータ未接続」と明記して継続
