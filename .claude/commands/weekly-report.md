週次進捗レポートを生成する。

1. ~/repos/ 配下の全リポジトリで `git log --oneline --since="7 days ago"` を実行
2. プロジェクトごとにコミットを集計
3. 以下の形式でレポートを出力:

## 今週の進捗（YYYY-MM-DD 〜 YYYY-MM-DD）

### Life Dashboard
- feat: xxx（N commits）
- fix: xxx

### note-automation
- ...

### 所感
（コミット内容から推測される進捗状況のサマリー）

### 来週やるべきこと
（未完了と思われるタスクの推測）

4. ~/repos/note-automation/drafts/weekly-YYYY-MM-DD.md に保存
