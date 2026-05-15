---
description: 新規アプリ着想を受領し、Gemini ブレスト用ハンドオフプロンプトを生成。「新規アプリ」「アイデア」「こんなのどう」キーワードでも発火。
---

# /new-app (新規アプリ) — CPO 起動

## 引数

`/new-app <着想の自由文>` または引数なしで Tetsuya に着想を尋ねる。

## 実行手順

1. 本コマンド受領 → CoS 起動
2. CoS が CPO (subagent_type=cpo) を単独起動
3. CPO が以下を実施:
   - 既存ポートフォリオ (`tetsuya-os-canon/state/`) との整合 30 秒チェック
   - PMVV 整合判定（pmvv/purpose-mission-vision.md）
   - factory レーン or independent レーン推奨
   - canon org/roles/cpo.md の Gemini プロンプト format で整形
4. CPO 出力を Tetsuya に提示:

```
## 🆕 CPO ハンドオフ生成

### 30秒チェック
- 既存ポートフォリオ整合: <○/△/×>
- PMVV 整合: <○/△/×>
- レーン推奨: <factory|independent>

### 🔀 Gemini コピペ用プロンプト
---
<整形済みプロンプト>
---

### 戻ってきたら
Gemini の出力を貼ってもらえれば `org.app_pipeline` に登録します。
```

5. Supabase `org.handoff_prompts` に target='gemini' で保存
6. Tetsuya 承認後（次ターン）、`org.app_pipeline` に row 追加（stage='idea'）

## 失敗モード

- 着想が抽象すぎる場合 → CPO が「具体化質問1つ」を返す（1問だけ、判断負荷最小化）
- 既存と重複の場合 → CPO が重複候補を提示、Tetsuya 判断仰ぐ

## 起源

2026-05-15 確立。1000 アプリ戦略の量産入口。
