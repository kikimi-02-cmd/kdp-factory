---
description: 夜の総合振り返り。CTO + COO + CRO 並列召集 + 翌日タスク提示。「夜会」キーワードでも発火。
---

# /evening (夜会) — 一日の振り返り

## 召集

CoS 経由で並列起動:
1. **CTO** — 当日 commit / CI / 技術負債
2. **COO** — cron 発火 / factory throughput / 異常
3. **CRO** — 全 MRR / portfolio 状態 / kill 候補

## 出力 format

```
## 夜会 (YYYY-MM-DD)

### 🛠 CTO
<出力>

### ⚙️ COO
<出力>

### 💵 CRO
<出力>

### 🎯 翌日フォーカス (CoS)
明日の最優先1件 + 理由
```

## State

- `org.daily_briefings` に 3 行 insert (役職別、briefing_date=当日)
- `tetsuya-os-canon/journal/YYYY/MM/YYYY-MM-DD.md` に追記

## 引数

なし。
