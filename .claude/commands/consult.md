---
description: 自由相談。CoS が判定 → 単体 CXO or Chief Researcher 経由 ClaudeChat 誘導。「相談したい」キーワードでも発火。
---

# /consult (相談)

## 引数

`/consult <自由文>` または引数なし（Tetsuya に発話を促す）。

## 実行手順

1. CoS が受領 → ルーティング判定（org/README.md 判定表）
2. 単一領域に明確に該当 → 該当 CXO 1 体起動
3. 複数領域 or 深い議論 → Chief Researcher 経由 ClaudeChat ハンドオフ生成
4. 単純な事実確認 → CoS 自分で即答 + web_search

## 出力 format

ケース別:

**A. 単一 CXO 起動の場合**

```
## 相談 → <CXO>

<該当 CXO の出力 3-5 行>

### CoS 一言
<判断負荷軽減のための一文>
```

**B. ClaudeChat ハンドオフの場合**

```
## 相談 → ClaudeChat (Chief Researcher 整形)

### 🔀 コピペ用プロンプト
---
<canon format で整形>
---

### 戻ってきたら
結果を貼ってもらえれば CoS に取り込みます。
```

**C. 即答の場合**

```
## 相談 (CoS 即答)

<回答>

### 出典
- <memory/file/web>
```

## State

- 全ケースで `org.actions_log` に role='CoS' で記録
- B の場合さらに `org.handoff_prompts` に追加
