---
description: 朝の総合ブリーフィング。CFO + CMO + CWO + CFamO を並列召集して集約レポート。「おはよう」キーワードでも発火。
---

# /morning (おはよう) — 朝の総合ブリーフィング

## 召集

CoS 経由で以下 4 CXO を並列起動:

1. **CFO** (財務): 売上24h / Burn / 異常 / Action
2. **CMO** (マーケ): 流入24h / 公開予定 / 異常 / Action
3. **CWO** (健康): 睡眠 / 体調 / メンタル兆候 / Action
4. **CFamO** (家族): 直近イベント / 未消化 / 違和感 / Action

## 実行手順

1. 本コマンド受領 → CoS 起動
2. CoS が Agent tool で 4 CXO を並列起動（subagent_type を各 cfo/cmo/cwo/cfamo）
3. 各 CXO は自領域の正典（tetsuya-os-canon/org/roles/<cxo>.md）参照、後述の **morning briefing 4 セクションテンプレ** で出力
4. CoS が以下 format に集約:

```
## 朝のブリーフィング (YYYY-MM-DD)

### 💰 CFO
<CFO 出力>

### 📣 CMO
<CMO 出力>

### 💪 CWO
<CWO 出力>

### ❤️ CFamO
<CFamO 出力>

### 📋 Tetsuya 決裁要 (open approval issues)
<CoS が claude-harness の open Issues (label:needs-approval) を mcp__github__list_issues で取得して箇条書き>
- #<N> [CRO][kill-myevent] ... (期日 T-<X>)
- なければ「未決裁案件なし」と書く

### 🎯 CoS 推奨フォーカス
<今日の最優先1件 + 理由>
```

5. CoS が Supabase `org.daily_briefings` に 4 行 insert (役職別)
6. 同時に `tetsuya-os-canon/journal/YYYY/MM/YYYY-MM-DD.md` に追記

## morning briefing 4 セクションテンプレ (各 CXO 共通)

各 CXO は呼ばれたら以下 4 セクションを必ず埋める。空欄は「なし」と明記する（無視しない）。

```
### <emoji> <CXO>
- 昨日完了: <最大3件 / 「なし」>
- 今日の提案: <Tetsuya 承認なしで進められる 1-2 件>
- 決裁要: <あれば「#<Issue番号 or pending-key>」、なければ「なし」>
- Blocker: <あれば1行、なければ「なし」>
```

「昨日完了」は cron が `actions_log` に書いた result=ok の行から拾う。
「決裁要」は `needs-approval` ラベル付き open Issue または『今 Tetsuya に判断してほしい』案件。

## 失敗時

- 並列起動が context 圧迫した場合 → 逐次起動に fallback
- CXO が「データ未接続」を返したら、その旨を集約に明記して継続
- GitHub Issue 取得が失敗したら「Issue API 取得失敗、決裁要は不明」と書いて継続（ブロックしない）

## 引数

なし。日付はシステム日付を使用（AGENTS.md 絶対ルール #4）。

## 起源

2026-05-15 確立。組織図 v1 Phase 1。
2026-05-15 v2: 4 セクションテンプレ (完了/提案/決裁要/Blocker) + 決裁要 Issue 連携導入。
