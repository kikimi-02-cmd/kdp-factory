ハーネスの現状を分析し、改善提案を出してください。

## 分析対象
1. **CLAUDE.md** (グローバル + 現プロジェクト)
   - ルールは守られているか（最近のgit logで判断）
   - 冗長・矛盾するルールはないか
   - 追加すべきルールはないか

2. **Hooks** (~/.claude/settings.json)
   - 追加すべきHookはないか

3. **Subagents** (~/.claude/agents/)
   - 使われていないエージェントはないか
   - 不足しているエージェントはないか

4. **コンテキスト効率**
   - CLAUDE.mdが大きすぎないか（コンテキスト圧迫）

## 出力
```
Harness Review Report
━━━━━━━━━━━━━━━━━━━━━
CLAUDE.md: [score/10] — [summary]
Hooks:     [score/10] — [summary]
Agents:    [score/10] — [summary]

Top 3 Improvements:
  1. [highest impact]
  2. [second]
  3. [third]
```

改善は提案のみ。変更はユーザー承認後に実行。
