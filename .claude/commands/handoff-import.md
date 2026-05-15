---
description: Gemini / ClaudeChat の結果を org.handoff_prompts に取り込み。「取り込み」「Gemini 結果」キーワードでも発火。
---

# /handoff-import (取り込み)

## 引数

`/handoff-import <handoff_id>` で対象を指定するか、引数なしで Tetsuya に確認。

## 実行手順

1. CoS が `org.handoff_prompts` から `status='pending'` の最新行を取得（id 指定があればその行）
2. Tetsuya に「以下のハンドオフへの結果を貼ってください」と提示:
   ```
   ## 対象 handoff #<id>
   target: <gemini|claudechat>
   created_at: <時刻>

   ### 元プロンプト (抜粋)
   <prompt 最初の 200 字>
   ```
3. Tetsuya が結果テキストを貼る
4. CoS が以下を実行:
   - `result_summary` に貼られた内容を保存
   - `status` を `received` に変更
   - `responded_at` を NOW() に
5. 関連 CXO に解析を依頼:
   - target=gemini かつ source_role=CPO → CPO 起動、Kill criteria 抽出 → `org.app_pipeline` に新 row 提案
   - target=claudechat → Chief Researcher 起動、5 観点分析の要約

## 出力 format

```
## ✅ 取り込み完了 (handoff #<id>)

### 抽出
- <key takeaway 1>
- <key takeaway 2>

### 次のアクション
- [ ] <CPO/Researcher 推奨アクション 1>
- [ ] <推奨アクション 2>

### org.app_pipeline 更新案 (CPO のみ)
新規 row 候補:
- app_id: <suggest>
- kind: <factory|independent>
- stage: 'idea'
- notes: <抜粋>
Tetsuya 承認待ち。
```

## 失敗モード

- 該当 handoff が見つからない → エラー、`/consult` を推奨
- 結果が極端に短い (< 30 字) → 「結果が薄いです、本当にこれで良いですか」と確認
- 解析時に CPO / Chief Researcher が判定不能 → 「人手判定推奨」として未確定で保存

## State

- `org.handoff_prompts`: status / result_summary / responded_at を更新
- `org.actions_log`: role='CoS', action='handoff-import #<id>' で記録
- 新規 app pipeline 候補は Tetsuya 承認後のみ insert
