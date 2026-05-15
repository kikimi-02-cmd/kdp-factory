---
description: Session End Commit - 合意事項の振分と次セッション引継ぎ
---

# /tos-sec — Session End Commit

## 発火トリガ
- Tetsuya 明示信号(『終わり』『お疲れ』『次行こう』『今日はここまで』)
- 20往復警告と同時(統合運用、重複回避)
- Claude 自己検知の品質劣化兆候

## 出力構成

### A. 時系列合意リスト
本セッションで合意/決定した全項目をクロノロジカルに列挙。

### B. 振分ステータス
- ✅ memory 書込済
- 📋 handover 補完予定(次マイナー昇格時)
- 🔧 skills/commands 予定
- 📦 product 予定(コード/設定)
- ⚠️ 未振分(即提案要)

### C. 未振分項目の即振分提案
⚠️ 項目について、Claude が振分先を提案 → Tetsuya QC。

### D. handover差分出力
次マイナー昇格時に貼付できるフォーマットで:
- 反省記録 #N 追加分
- 絶対ルール変更分
- 🔴管理表更新分
- Appendix変更分

### E. 次セッション冒頭チェックリスト
新セッション開始時に Claude が即実行する項目:
- 正典 handover 読込
- 補完ファイル読込
- PMVV確認
- 装置1〜2 即実行(self-critique 3問 + 認識完全性宣言)
- 環境確認

## 終了条件
- 全項目が ✅/📋/🔧/📦 のいずれかに振分済(⚠️ ゼロ)
- 補完ファイル(session-handover-YYYY-MM-DD-*.md)が project knowledge に保存

## 制約
- Tetsuya 判断は最小化(Claude 主導、QC ロール固定)
- 「次行こう」は議題切替との区別要(判定曖昧時は Claude 確認)

## 参照
- memory#26 (SEC自動起動 + 自己修復連動)
- memory#11 (記録スキーム拡張実装)
