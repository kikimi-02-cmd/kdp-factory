---
description: handover昇格5ステップ - 単一真実ソース維持
---

# /tos-handover-promotion — handover昇格プロトコル

## 発火トリガ
- 補完ファイル ≥ 5本
- critical 🔴 項目を正典が含んでいない
- Tetsuya 明示要求
- v3.0昇格条件のいずれか達成
  (HonneX Stripe着手 / F1終了 / 四半期 / /gap運用3ヶ月 / β完了)

## ステップ

### Step 1: 正典スキャン
現正典 (tetsuya-os-handover-vX_Y.md) の全節を読込、構造把握。

### Step 2: 補完差分吸収
全補完ファイル(session-handover-*.md)の差分を抽出、正典への統合候補を整理。

### Step 2.5: 変更領域の最新BP web_search(必須)
今回の昇格で触る領域すべてについて
project_knowledge_search → web_search で最新BP確認。
- 既存BP 30日以内 = 流用
- 30日超 = web_search 補完
- 既存BPなし = web_search 必須

### Step 3: ラベル粒度QC
- タスク > 60分 = 分割候補
- ラベルは「動詞 + 対象 + 完了条件」形式
- 🔴/🟡/🟢 階層化、漠然不安解消視点で再分類

### Step 4: Tetsuya QC
新版ドラフトを Tetsuya に提示、構造変更点のみ判断要請。
微細な文言修正は Claude 主導で完結。

### Step 5: 新版生成
- 単一真実ソース(SoT)= 新版 vX_Y.md のみ
- 旧版は archive(削除はしない、参照リンクのみ)
- 補完ファイルは「v2.X.Y で吸収済」マーク → 退役

## 終了条件
- 正典は1ファイルのみ(SoT原則)
- 全補完が「吸収済 or 退役」明示
- next_promotion_trigger 条件が handover 冒頭に明記

## 制約
- マイナー昇格 = 軽量5ステップ
- メジャー昇格 = 全節レビュー、PMVV再確認

## 参照
- file:handover-promotion-protocol-v1.md
- memory#29 (昇格プロトコル本体)
- memory#30 (期日前倒し原則連動)
