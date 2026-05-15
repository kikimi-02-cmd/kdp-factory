---
description: 週次 MIC 統合レポート。CRO 主導 + 全 CXO 寄稿。「週次」「Weekly MIC」「ウィークリー」キーワードでも発火。
---

# /weekly (週次) — Weekly MIC 統合

## 召集

CoS 経由、CRO を司会として全 CXO を順次起動（並列 4 体ずつバッチ）:

**バッチ 1 (戦略 + 事業):** CSO + CRO + CFO + CMO
**バッチ 2 (実装 + 運用 + 企画):** CTO + COO + CPO
**バッチ 3 (生活):** CWO + CFamO + CLO + CXO-Exp
**バッチ 4 (調査):** Chief Researcher (週次トピック総括)

## 出力 format

```
## Weekly MIC YYYY-Www (YYYY-MM-DD ~ YYYY-MM-DD)

### 🧭 戦略 (CSO)
### 💵 収益 + portfolio (CRO 週次)
### 💰 財務 (CFO 週次)
### 📣 マーケ (CMO 週次)
### 🛠 開発 (CTO 週次)
### ⚙️ 運用 (COO 週次)
### 🆕 企画 (CPO 週次)
### 💪 健康 (CWO 週次)
### ❤️ 家族 (CFamO 週次)
### 📚 学習 (CLO)
### 🎨 体験 (CXO-Exp)
### 🔍 調査 (Chief Researcher)

### 🎯 来週フォーカス (CoS)
- 最優先 3 件
- 来週決裁が必要な事項
```

## State

- `org.daily_briefings` に 12 行 insert (briefing_date=日曜)
- `tetsuya-os-canon/journal/YYYY/MM/YYYY-Www.md` に統合レポート保存

## Cadence

- 自然な発火: 月曜 JST or 「週次」発話時
- 既存の `/tos-weekly-mic` (canon) との関係: 本コマンドは org 体系版、`/tos-weekly-mic` は手続き版。完全移行までは両立。

## 引数

なし（週は当日基準で前週日曜〜土曜で確定）。
