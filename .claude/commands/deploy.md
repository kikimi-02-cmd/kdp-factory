Vercelデプロイ前のチェックと実行:

1. `npx tsc --noEmit`（型チェック）
2. `npx vitest run`（テスト）
3. `npx next build`（ビルド確認）
4. 全パスしたら `git add . && git commit` → `git push origin main`
5. 結果を報告

エラーが1つでもあれば修正案を提示して**止まる**こと。
自動修正して再実行しない（人間が判断する）。
