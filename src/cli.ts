import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { makePuzzle, type Difficulty } from "./sudoku.js";
import {
  makeWordSearch,
  isValidWordSearch,
  WORD_BANK_NAMES,
  type WSDifficulty,
} from "./wordsearch.js";
import {
  renderBookPdf,
  renderCoverPdf,
  renderWordSearchPdf,
  type BookPuzzle,
  type WordSearchBookPuzzle,
} from "./pdf.js";
import { buildMetadata, buildWordSearchMetadata } from "./metadata.js";
import { editionsFor, type Edition } from "./editions.js";
import { appendBooks, type BookRecord } from "./state.js";

const [, , cmd, ...rest] = process.argv;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATE_PATH = join(ROOT, "state", "kdp-factory.json");
const KNOWN_CATEGORIES = ["sudoku", "word-search", "coloring", "journal", "crossword"];
const IMPLEMENTED = new Set(["sudoku", "word-search"]);

function help() {
  console.log(`kdp-factory CLI

  generate --category <name> --count <n> [--puzzles <perBook>] [--difficulty mixed|easy|medium|hard] [--author <name>]
                                             Generate N books in a category
  generate --batch <N> [--category <name>] [...same flags]
                                             Alias for --count <N> (batch run)
  generate --catalog [--category <name>] [--count <n>] [--author <name>]
                                             Generate distinct-SKU editions from the catalog
                                             (differentiated titles/niches; --count repeats as
                                             Vol.2,3... never identical duplicates → no KDP flags)
  list-categories                            Show available categories
  --help                                     Show this help

Implemented categories: ${[...IMPLEMENTED].join(", ")}.
Generation only — nothing is ever published.
`);
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = "true";
      }
    }
  }
  return flags;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function pickDifficulty(mode: string, puzzleIndex: number): Difficulty {
  if (mode === "easy" || mode === "medium" || mode === "hard") return mode;
  // mixed: cycle easy -> medium -> hard
  return DIFFICULTIES[puzzleIndex % DIFFICULTIES.length];
}

function slugTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function generate(args: string[]) {
  const flags = parseFlags(args);
  const category = flags.category ?? "sudoku";

  if (!KNOWN_CATEGORIES.includes(category)) {
    console.error(`Unknown category: ${category}`);
    console.error(`Available: ${KNOWN_CATEGORIES.join(", ")}`);
    process.exit(1);
  }
  if (!IMPLEMENTED.has(category)) {
    console.log(
      `Category "${category}" not implemented yet (implemented: ${[...IMPLEMENTED].join(", ")}).`,
    );
    process.exit(0);
  }

  // --batch <N> is an alias for --count <N>.
  const countRaw = flags.batch ?? flags.count ?? "1";
  const count = Math.max(1, parseInt(countRaw, 10) || 1);
  const perBook = Math.max(1, parseInt(flags.puzzles ?? "50", 10) || 50);
  const difficultyMode = (flags.difficulty ?? "mixed").toLowerCase();
  const author = flags.author;

  if (!["mixed", "easy", "medium", "hard"].includes(difficultyMode)) {
    console.error(`Invalid --difficulty: ${difficultyMode}`);
    process.exit(1);
  }

  // --catalog: walk the distinct-SKU edition catalog (differentiated titles /
  // niches) instead of N identical "Vol. N" books. Repeats become Vol.2/3 of the
  // same edition (a legit series), never byte-identical duplicates (KDP flag risk).
  const catalog = flags.catalog !== undefined && flags.catalog !== "false";
  const editions = catalog ? editionsFor(flags.category) : [];
  if (catalog && editions.length === 0) {
    console.error(`No editions for category "${flags.category}".`);
    process.exit(1);
  }
  const hasExplicitCount = flags.batch !== undefined || flags.count !== undefined;
  const totalBooks = catalog && !hasExplicitCount ? editions.length : count;

  const batch = slugTimestamp();
  const batchAt = new Date().toISOString();
  const records: BookRecord[] = [];
  const volByEdition = new Map<string, number>();

  for (let b = 0; b < totalBooks; b++) {
    const edition = catalog ? editions[b % editions.length] : undefined;
    const cat = edition ? edition.category : category;
    let bookNumber: number;
    if (edition) {
      bookNumber = (volByEdition.get(edition.key) ?? 0) + 1;
      volByEdition.set(edition.key, bookNumber);
    } else {
      bookNumber = b + 1;
    }
    const bookId = `${batch}-${String(b + 1).padStart(3, "0")}`;
    const outDir = join(ROOT, "output", cat, bookId);
    await mkdir(outDir, { recursive: true });

    const bookArgs: BookArgs = {
      outDir,
      bookId,
      bookNumber,
      perBook,
      difficultyMode: edition ? String(edition.difficulty) : difficultyMode,
      author,
      edition,
    };
    const record =
      cat === "word-search"
        ? await generateWordSearchBook(bookArgs)
        : await generateSudokuBook(bookArgs);

    records.push(record);
    console.log(
      `[${b + 1}/${totalBooks}] ${bookId} — ${record.title}: ${record.puzzle_count} puzzles, ${record.page_count} pages`,
    );
  }

  // State write-back: append every generated book and stamp last_batch_at.
  const state = await appendBooks(STATE_PATH, records, batchAt);
  console.log(
    `State updated: ${records.length} book(s) appended (total ${state.books.length}), last_batch_at=${batchAt}.`,
  );

  console.log(`Done. Generated ${totalBooks} book(s). Generation only — nothing published.`);
}

interface BookArgs {
  outDir: string;
  bookId: string;
  bookNumber: number;
  perBook: number;
  difficultyMode: string;
  author?: string;
  edition?: Edition;
}

async function generateSudokuBook(a: BookArgs): Promise<BookRecord> {
  const puzzles: BookPuzzle[] = [];
  for (let i = 0; i < a.perBook; i++) {
    const difficulty = pickDifficulty(a.difficultyMode, i);
    const { puzzle, solution } = makePuzzle(difficulty);
    puzzles.push({ index: i + 1, difficulty, puzzle, solution });
  }

  // 1 title + perBook puzzle pages + 1 solutions divider + ceil(perBook/6) solution pages
  const solutionPages = Math.ceil(a.perBook / 6);
  const pageCount = 1 + a.perBook + 1 + solutionPages;

  // Build metadata first so title/subtitle drive the interior AND the cover (consistency).
  const metadata = buildMetadata({
    author: a.author,
    puzzleCount: a.perBook,
    difficulty: a.difficultyMode as Difficulty | "mixed",
    pageCount,
    interiorPath: "interior.pdf",
    bookNumber: a.bookNumber,
    titleNoun: a.edition?.titleNoun,
    audience: a.edition?.audience,
    largePrint: a.edition?.largePrint,
  });

  const pdfBytes = await renderBookPdf({
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: a.author ?? "Puzzle Press",
    puzzles,
  });
  await writeFile(join(a.outDir, "interior.pdf"), pdfBytes);

  const coverBytes = await renderCoverPdf({
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: a.author ?? "Puzzle Press",
    backBlurb: metadata.description,
    pageCount,
    accentIndex: a.bookNumber - 1,
  });
  await writeFile(join(a.outDir, "cover.pdf"), coverBytes);

  await writeFile(
    join(a.outDir, "metadata.json"),
    JSON.stringify({ ...metadata, coverPath: "cover.pdf" }, null, 2),
    "utf8",
  );

  return {
    id: a.bookId,
    category: "sudoku",
    title: metadata.title,
    created_at: new Date().toISOString(),
    output_path: `output/sudoku/${a.bookId}`,
    puzzle_count: a.perBook,
    page_count: pageCount,
    difficulty: metadata.difficulty,
  };
}

async function generateWordSearchBook(a: BookArgs): Promise<BookRecord> {
  const wsDifficulties: WSDifficulty[] = ["easy", "medium", "hard"];
  const pickWs = (i: number): WSDifficulty => {
    if (
      a.difficultyMode === "easy" ||
      a.difficultyMode === "medium" ||
      a.difficultyMode === "hard"
    ) {
      return a.difficultyMode;
    }
    return wsDifficulties[i % wsDifficulties.length];
  };

  const puzzles: WordSearchBookPuzzle[] = [];
  const themesUsed = new Set<string>();
  for (let i = 0; i < a.perBook; i++) {
    const difficulty = pickWs(i);
    // Themed edition → one theme for the whole book; otherwise rotate banks.
    const theme = a.edition?.theme ?? WORD_BANK_NAMES[i % WORD_BANK_NAMES.length];
    const puzzle = makeWordSearch(difficulty, theme);
    // integrity guard: regenerate if a puzzle is somehow inconsistent
    if (!isValidWordSearch(puzzle)) {
      throw new Error(`word-search integrity check failed for puzzle ${i + 1}`);
    }
    themesUsed.add(puzzle.theme);
    puzzles.push({ index: i + 1, puzzle });
  }

  // 1 title + perBook puzzle pages + 1 solutions divider + >=1 solution list page
  const pageCount = 1 + a.perBook + 1 + Math.max(1, Math.ceil(a.perBook / 8));

  const metadata = buildWordSearchMetadata({
    author: a.author,
    puzzleCount: a.perBook,
    difficulty: a.difficultyMode as WSDifficulty | "mixed",
    pageCount,
    interiorPath: "interior.pdf",
    bookNumber: a.bookNumber,
    themes: [...themesUsed],
    titleNoun: a.edition?.titleNoun,
    themeLabel: a.edition?.themeLabel,
    largePrint: a.edition?.largePrint,
  });

  const pdfBytes = await renderWordSearchPdf({
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: a.author ?? "Puzzle Press",
    puzzles,
  });
  await writeFile(join(a.outDir, "interior.pdf"), pdfBytes);

  const coverBytes = await renderCoverPdf({
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: a.author ?? "Puzzle Press",
    backBlurb: metadata.description,
    pageCount,
    accentIndex: a.bookNumber - 1,
  });
  await writeFile(join(a.outDir, "cover.pdf"), coverBytes);

  await writeFile(
    join(a.outDir, "metadata.json"),
    JSON.stringify({ ...metadata, coverPath: "cover.pdf" }, null, 2),
    "utf8",
  );

  return {
    id: a.bookId,
    category: "word-search",
    title: metadata.title,
    created_at: new Date().toISOString(),
    output_path: `output/word-search/${a.bookId}`,
    puzzle_count: a.perBook,
    page_count: pageCount,
    difficulty: metadata.difficulty,
  };
}

async function main() {
  switch (cmd) {
    case "list-categories":
      console.log(KNOWN_CATEGORIES.join("\n"));
      return;
    case "generate":
      await generate(rest);
      return;
    case undefined:
    case "--help":
    case "-h":
      help();
      return;
    default:
      console.error(`Unknown command: ${cmd}`);
      help();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
