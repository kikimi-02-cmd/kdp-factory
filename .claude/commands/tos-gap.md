---
description: ギャップスキャン - 漠然不安解消のための階層棚卸し
---

# /tos-gap — ギャップスキャン

## 発火トリガ
- 🔴管理棚卸しが必要と Claude 判断時
- Tetsuya 明示要求(『今ある仕掛かりは?』等)
- 月次相当(週次MICに統合済、ただし手動再点検可)

## ステップ

### Step 1: 棚卸し
- 正典 handover の🔴/🟡/🟢管理表
- 補完ファイル群の open items
- memory に記録された未完了項目

### Step 2: ドリフト検出
- 正典と補完の差分(昇格漏れ候補)
- memory と handover の差分(file化漏れ候補)
- 重複検出(統合候補)

### Step 3: 階層化
- 🔴 画面上(今動くべきもの、Tetsuya QC対象)
- 🟡 引き出し(traction出たら起動、Claude 監視)
- 🟢 金庫(将来候補、休眠)

判断負荷最小化: 🔴 12件以下を目安、超過時は階層降格提案。

### Step 4: 出力
件数表(増減と理由) + 昇格漏れ候補 + 統合候補 + 階層降格提案。

### Step 5: Tetsuya QC
🔴 の階層変更のみ判断要請、🟡🟢は Claude 自律。

### Step 6: 反映
『出して』承認後に handover 管理表を更新。
補完ファイル(session-handover-YYYY-MM-DD-gap-scan.md)生成。

## 制約
- 月次gap-scanは tos-weekly-mic に統合済
- 件数超過時、Claude は機械的に階層降格しない(Tetsuya 判断要)

## 参照
- file:gap-command-spec-v1.md
- memory#11 (記録スキーム連動)
