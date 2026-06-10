# kdp-factory

Low-content KDP book generation pipeline.
See `claude-harness/proposals/passive-income/2026-05-13-architecture.md` (M+3 onwards).

> Generation only. This tool never publishes to Amazon/KDP or any external service. It writes print-ready files to `output/` (gitignored).

## CLI

```
npm install
npx tsx src/cli.ts --help
```

## Sudoku vertical (first implemented category)

Generates print-ready low-content sudoku puzzle books for Amazon KDP.

```
npx tsx src/cli.ts generate --category sudoku --count 3 --puzzles 50 --difficulty mixed
```

Flags:

- `--category sudoku` — only `sudoku` is implemented; other categories print a "not implemented yet" notice.
- `--count <n>` — number of books to generate (default 1).
- `--puzzles <perBook>` — puzzles per book (default 50).
- `--difficulty mixed|easy|medium|hard` — `mixed` cycles easy→medium→hard (default `mixed`).
- `--author <name>` — author name on the title page / metadata (default `Puzzle Press`).

For each book it writes:

- `output/sudoku/<bookId>/interior.pdf` — the print-ready interior.
- `output/sudoku/<bookId>/metadata.json` — KDP listing metadata (title, subtitle, description, keywords, BISAC categories, trim size, page count).

`bookId` is `<timestamp>-<index>`.

### KDP specs used

- Trim size: 8.5 x 11 in (612 x 792 pt at 72 dpi).
- Margins: ~0.5 in (36 pt) inner/outer.
- Layout: title page, then one large grid per page (puzzle number + difficulty label), then a "Solutions" section (6 grids per page) at the back.
- Grid: 9x9 with thicker lines on the 3x3 box boundaries; given digits rendered in Helvetica.

### How puzzles are generated (`src/sudoku.ts`)

- `generateSolved()` — complete valid solution via randomized backtracking.
- `makePuzzle(difficulty)` — removes cells in random order while verifying a **unique** solution (`countSolutions` stops at 2). Difficulty sets the target number of givens (easy 40 / medium 32 / hard 26).
- `solve()` / `countSolutions()` — backtracking solver / solution counter.

## Commands

- `npm test` — runs the sudoku test suite (`node --import tsx --test`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run cli` — `tsx src/cli.ts`.
