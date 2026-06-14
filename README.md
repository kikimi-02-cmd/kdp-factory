# kdp-factory

Low-content KDP book generation pipeline.
See `claude-harness/proposals/passive-income/2026-05-13-architecture.md` (M+3 onwards).

> Generation only. This tool never publishes to Amazon/KDP or any external service. It writes print-ready files to `output/` (gitignored).

## CLI

```
npm install
npx tsx src/cli.ts --help
```

## Implemented verticals

`sudoku` and `word-search` are implemented; `coloring` / `journal` / `crossword`
print a "not implemented yet" notice.

```
npx tsx src/cli.ts generate --category sudoku --count 3 --puzzles 50 --difficulty mixed
npx tsx src/cli.ts generate --category word-search --batch 5 --puzzles 30
```

Flags:

- `--category <name>` — `sudoku` (default) or `word-search`.
- `--count <n>` — number of books to generate (default 1).
- `--batch <n>` — alias for `--count <n>` (batch run).
- `--puzzles <perBook>` — puzzles per book (default 50).
- `--difficulty mixed|easy|medium|hard` — `mixed` cycles easy→medium→hard (default `mixed`).
- `--author <name>` — author name on the title page / metadata (default `Puzzle Press`).

### Word-search vertical (`src/wordsearch.ts`)

- `makeWordSearch(difficulty, theme?)` — places themed words in 8 directions
  (incl. diagonals/reverse), then fills blanks with random letters. Built-in
  themed word banks (`animals` / `fruits` / `ocean` / `weather` / `kitchen`),
  rotated across puzzles for variety.
- `isValidWordSearch()` / `findWord()` — solution-integrity guard: every recorded
  placement must spell its word **and** be independently re-findable by a fresh
  grid scan. Generation throws if a puzzle fails the check.
- Each puzzle page shows the letter grid + theme word list; the back has an
  answer key listing every word's start coordinate and direction.

### State ledger (`state/kdp-factory.json`)

Every generated book is appended to `books[]` (id / category / title /
created_at / output_path / puzzle_count / page_count / difficulty) and
`last_batch_at` is stamped. The state layer (`src/state.ts`) only persists the
ledger — it never publishes.

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
