---
description: アプリのピボット/Kill 判定。CRO + Chief Researcher 並列召集。「ピボット判定」「pivot」キーワードでも発火。
---

# /pivot-check (ピボット判定)

## 引数

`/pivot-check <app_id>` 必須。

## 召集

CoS 経由で並列起動:
1. **CRO** — kill criteria 判定（30/90 日経過 + MRR 推移 + DAU 推移）
2. **Chief Researcher** — 市場/競合の変化、ピボット先候補の市場性

## 出力 format

```
## ピボット判定 <app_id> (YYYY-MM-DD)

### CRO 判定
- stage: <現在の stage>
- 経過: <stage 開始から N 日>
- kill criteria 該当: <yes/no + 根拠>
- MRR / DAU 推移: <直近 30 日>

### Chief Researcher
- 市場変化: <あれば>
- ピボット先候補 (3 つ):
  1. <候補> - 市場性 <high/mid/low>
  2. ...
  3. ...

### 推奨判定
- [ ] 継続 (理由: ...)
- [ ] ピボット → <候補>
- [ ] Kill (kill_at: YYYY-MM-DD 予定)
- [ ] M&A 検討 → `/ma-prep <app_id>`

### Tetsuya の決裁待ち
```

## State

- `org.actions_log` にピボット判定実行を記録
- Tetsuya 決裁後、`org.app_pipeline` の `stage` / `last_decision` を更新
