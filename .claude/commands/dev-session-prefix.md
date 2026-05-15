---
description: Code session 冒頭で必ず実行する prefix — 現在 branch / 直近 PR / 直近 commit / 作業状態を把握してから着手する
---

# /dev-session-prefix — Code セッション冒頭の状況把握テンプレ

## 発火トリガ

- **すべての Code セッション開始時に自動実行**(specialist-dev 系の指示書に従う Code subagent も含む)
- 反省 #93(Code 側 context 断絶)の再発防止装置

## 目的

セッション開始時に「現在のリポ・ブランチ・直近の動き」を 30 秒で把握してから着手することで、以下を防ぐ:

- 別人セッションの作業内容を上書き / 重複実装(反省 #93 型)
- 古い前提で進めて手戻り(branch を勘違いして main に直 commit など)
- 既存 PR や open issue の把握漏れで重複 PR 起票

## 実行手順

セッション開始直後、対象リポの作業ディレクトリで以下を順に実行する:

```bash
# 1. 現在 branch (絶対ルール #16: branch 確認なしの commit 禁止)
git branch --show-current

# 2. 直近 PR(open 3 件)
echo "=== 直近 open PR ==="
gh pr list -R kikimi-02-cmd/<REPO> --state open --limit 3 \
  --json number,title,headRefName,createdAt \
  --jq '.[] | "  #\(.number) [\(.headRefName)] \(.title) (\(.createdAt[:10]))"' \
  2>/dev/null || echo "  (gh CLI unavailable or repo not in scope)"

# 3. 直近 commit
echo "=== 直近 commit (last 5) ==="
git log --oneline -5

# 4. 現在 working tree 状態
echo "=== working tree status ==="
git status --short

# 5. 最新 remote との差分
echo "=== remote 同期状態 ==="
git fetch origin --quiet 2>/dev/null
git log --oneline @{u}..HEAD 2>/dev/null | head -3 \
  | sed 's/^/  unpushed: /' || true
git log --oneline HEAD..@{u} 2>/dev/null | head -3 \
  | sed 's/^/  unpulled: /' || true
```

実行結果を Tetsuya にも見える形でセッション冒頭に出力すること(verbose 推奨)。

## `<REPO>` の解決

実行コンテキストの作業ディレクトリ名から推定する(例: `/home/user/x-auto` → `x-auto`)。
解決できない場合は手順 2 を skip し、`gh pr list` 結果なしで継続する。

## Code 指示書側の必須記載

specialist-dev 系の Code 指示書(`commands/specialist-dev.md` や proposal 内の Code 発注パート)では、Code への指示の冒頭に以下を必ず含めること:

```
作業着手前に /dev-session-prefix を実行し、結果を貼り付けてから本タスクに入ること。
```

これは proposal を起票する Specialist Agent 側の責務であり、Tetsuya がいちいち書く必要はない。

## 失敗時の方針

- `gh CLI` が利用できない / リポが scope 外 → 手順 2 を skip(エラーで止めない)
- `git fetch` が失敗(ネットワーク等)→ 手順 5 を skip
- 手順 1, 3, 4 は git だけで動くため失敗しない前提

prefix 全体は **読み取り専用** であり、副作用は git fetch のみ(remote ref 更新のみ、working tree 変更なし)。

## 関連

- 反省 #93 (chapter 切替把握漏れ、Code 側 context 断絶) — 本 prefix で再発防止
- 絶対ルール #16 (branch 確認なしの commit 禁止) — 手順 1 で遵守
- MIC-2026-05-10-002 (Code スクリプト冒頭 prefix 必須化) — 本ファイルで実現
- dev specialist proposal 2026-05-14 Priority 2 / 2026-05-13 Top 3 — 本ファイルで実装

## バージョン

- v0.1 (2026-05-15): 初版起票、MIC-002 対応
