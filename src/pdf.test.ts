import { test } from "node:test";
import assert from "node:assert/strict";
import { makePuzzle } from "./sudoku.js";
import { renderBookPdf, type BookPuzzle } from "./pdf.js";

// Regression: solutions are laid out 6/page (2x3). The grid was sized by column
// width only (~244pt) while each row is only ~227pt tall, so square grids bled
// into the row below = overlapping solutions (2026-06-23 bug). pdf.ts now sizes
// the grid to min(width, height) and throws on overflow. A full page of
// solutions must render without that guard firing.
test("solutions page renders 6+ grids without overlap (no throw)", async () => {
  const puzzles: BookPuzzle[] = [];
  for (let i = 0; i < 7; i++) {
    const { puzzle, solution, difficulty } = makePuzzle("easy");
    puzzles.push({ index: i + 1, difficulty, puzzle, solution });
  }
  const bytes = await renderBookPdf({
    title: "T",
    subtitle: "S",
    author: "A",
    puzzles,
  });
  assert.ok(bytes.length > 0, "PDF should be produced");
});
