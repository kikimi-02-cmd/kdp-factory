---
description: 週次MIC自己点検 - memory/handover/反省/BP/ハーネス整合性スキャン
---

# /tos-weekly-mic — 週次MIC自己点検

## 発火トリガ
- JST月曜セッション初回(Claude自発)
- 火〜日初回で last_mic_date が7日超(lazy fire)
- Tetsuya 明示要求

## 前提
- last_mic_date は handover 冒頭に記録、毎週更新
- 判断負荷目安: 🔴 3件以下(超過時 Claude が優先順位提案)

## ステップ

### Step 1A: 資産inventory(Code側、JSON出力)
- memory全件
- 正典 handover (tetsuya-os-handover-vX_Y.md)
- 直近1週間の反省記録
- BP系ファイル(last_bp_check 30日超を抽出)
- ハーネス資産(claude-harness commands/hooks/agents/CLAUDE.md)
- memory容量(残り枠数)

### Step 1B: 外部BP取込(Web/thought-os)
- 直近1週Code運用BP(Hooks/Skills/Agent Teams 等)
- BP陳腐化候補スキャン: Step 1A で抽出した last_bp_check 30日超ファイルを
  web_search で最新BP確認

### Step 2-5: 9観点スキャン(Chat側、🔴🟡🟢階層化)
1. 矛盾候補(memory/handover/file間のルール競合)
2. 未発動候補(定義あるが運用されていないルール)
3. 昇格候補(週内3回以上発生した反省パターン)
4. BP陳腐化候補(Layer 1〜3スキーム連動)
5. memory整理候補(統合/削除で枠創出)
6. ハーネス陳腐化(claude-harness の更新有無)
7. 外部BP進化(thought-os daily_ingest 連動)
8. 新ハーネス概念(Code運用の最新パターン)
9. 当週事故由来改善(反省記録から構造改善案)

### Step 6: Tetsuya QC
🔴件数のみ判断、🟡🟢は Claude が処理。
出典必須(memory#N / file:xxx / Web:URL)。

### Step 7: 書込
『出して』承認後に memory_user_edits / handover 補完 / file更新を実行。

## 終了条件
- last_mic_date 更新(handover 冒頭)
- 🔴件は 振分ステータス決定(✅/📋/🔧/📦/⚠️)

## 参照
- file:weekly-mic-spec-v3 (詳細仕様)
- memory#25 v3 (運用ルール)
