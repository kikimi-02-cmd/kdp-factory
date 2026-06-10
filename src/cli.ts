import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { makePuzzle, type Difficulty } from "./sudoku.js";
import { renderBookPdf, type BookPuzzle } from "./pdf.js";
import { buildMetadata } from "./metadata.js";

const [, , cmd, ...rest] = process.argv;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KNOWN_CATEGORIES = ["sudoku", "word-search", "coloring", "journal", "crossword"];
const IMPLEMENTED = new Set(["sudoku"]);

function help() {
  console.log(`kdp-factory CLI

  generate --category <name> --count <n> [--puzzles <perBook>] [--difficulty mixed|easy|medium|hard] [--author <name>]
                                             Generate N books in a category
  list-categories                            Show available categories
  --help                                     Show this help

Only "sudoku" is implemented (first vertical). Generation only — nothing is published.
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
      `Category "${category}" not implemented yet (sudoku is the first vertical).`,
    );
    process.exit(0);
  }

  const count = Math.max(1, parseInt(flags.count ?? "1", 10) || 1);
  const perBook = Math.max(1, parseInt(flags.puzzles ?? "50", 10) || 50);
  const difficultyMode = (flags.difficulty ?? "mixed").toLowerCase();
  const author = flags.author;

  if (!["mixed", "easy", "medium", "hard"].includes(difficultyMode)) {
    console.error(`Invalid --difficulty: ${difficultyMode}`);
    process.exit(1);
  }

  const batch = slugTimestamp();

  for (let b = 0; b < count; b++) {
    const bookNumber = b + 1;
    const bookId = `${batch}-${String(bookNumber).padStart(3, "0")}`;
    const outDir = join(ROOT, "output", "sudoku", bookId);
    await mkdir(outDir, { recursive: true });

    const puzzles: BookPuzzle[] = [];
    for (let i = 0; i < perBook; i++) {
      const difficulty = pickDifficulty(difficultyMode, i);
      const { puzzle, solution } = makePuzzle(difficulty);
      puzzles.push({ index: i + 1, difficulty, puzzle, solution });
    }

    const title = `Sudoku Puzzle Book Vol. ${bookNumber}`;
    const diffLabel =
      difficultyMode === "mixed" ? "Easy to Hard" : capitalize(difficultyMode);
    const subtitle = `${perBook} ${diffLabel} Puzzles for Adults with Solutions`;

    const pdfBytes = await renderBookPdf({
      title,
      subtitle,
      author: author ?? "Puzzle Press",
      puzzles,
    });

    const interiorPath = join(outDir, "interior.pdf");
    await writeFile(interiorPath, pdfBytes);

    // page count: 1 title + perBook puzzle pages + 1 solutions divider
    // + ceil(perBook / 6) solution pages
    const solutionPages = Math.ceil(perBook / 6);
    const pageCount = 1 + perBook + 1 + solutionPages;

    const metadata = buildMetadata({
      author,
      puzzleCount: perBook,
      difficulty: difficultyMode as Difficulty | "mixed",
      pageCount,
      interiorPath: "interior.pdf",
      bookNumber,
    });

    await writeFile(
      join(outDir, "metadata.json"),
      JSON.stringify(metadata, null, 2),
      "utf8",
    );

    console.log(
      `[${bookNumber}/${count}] ${bookId}: ${perBook} puzzles, ${pageCount} pages, ${(pdfBytes.length / 1024).toFixed(0)} KB -> output/sudoku/${bookId}/`,
    );
  }

  console.log(`Done. Generated ${count} book(s). Generation only — nothing published.`);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
