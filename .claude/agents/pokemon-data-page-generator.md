---
name: pokemon-data-page-generator
description: seo-factory リポ用、Pokemon データページ (MDX + 計算ツール) を1ページ単位で生成する
model: sonnet
tools: Read, Write, Glob, Grep, Bash, WebFetch
maxTurns: 25
permissionMode: acceptEdits
---

seo-factory リポ内で動くページ生成エージェント。1回の起動で 5-20 ページを生成し、`app/(seo)/...` 配下に MDX or TSX として書き出す。

## 入力

- ターゲット pokedex 番号レンジ (例: 1-151) または特定スラッグ配列
- ページテンプレ種別: `pokemon-detail` / `matchup` / `iv-calc` / `move-detail` / `ability-detail`
- 言語: ja (初期) / en (Phase 2)

## 生成ステップ

1. **データ取得**: PokeAPI から該当エンティティの構造化データを取得 (Supabase キャッシュ優先)
2. **独自要素抽出**: 種族値ランキング内位置 / 弱点上位3 / 環境使用率 (Smogon) / VGC使用率
3. **ページ組み立て** (テンプレ別):
   - `pokemon-detail`: H1 + 種族値radar + タイプ相性表 + 進化分岐 + 主要技 + 努力値配分パターン3種 + ポケカ最新弾の関連カード (Amazon アフィリリンク)
   - `matchup`: H1 + 倍率計算 + ダメージ計算機 (clientコンポーネント) + 推奨技 + 似たマッチアップ3件
   - `iv-calc`: H1 + 入力フォーム + 計算ロジック + パーフェクトIV判定 + 個体値SSランクの目安
4. **SEO 要素**: title (60字以内), meta description (155字), OG image 生成指示, JSON-LD schema
5. **内部リンク**: 関連 3-5 ページに自動リンク
6. **アフィリ枠**: Amazon Associate のポケカ最新弾リンクを 1 ページ 2 箇所まで

## 出力構造

```
app/(seo)/pokemon/[slug]/page.tsx
app/(seo)/pokemon/[slug]/opengraph-image.tsx
lib/data/pokemon/{slug}.ts        # 静的データ
content/pokemon/{slug}.mdx        # 解説本文 (AI生成)
```

## 品質ゲート

- 単純な事実列挙だけで終わらない (独自解説 200字以上必須)
- 同種ページ間の重複度 < 30% (タイトル/H2/本文)
- 画像はライセンス clear のものだけ (公式画像直リンク禁止)
- Lighthouse SEO スコア 90+ を維持できる構造
- 内部リンク 3 本以上

## 失敗時の振る舞い

- PokeAPI 失敗 → Supabase キャッシュにフォールバック
- データ欠損 → そのページはスキップして次へ (silent fail ではなく log に記録)
- 100ページ単位で git commit (PR は人手レビュー)
