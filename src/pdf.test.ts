import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { makePuzzle } from "./sudoku.js";
import { renderBookPdf, renderCoverPdf, type BookPuzzle } from "./pdf.js";

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

// KDP full-wrap cover must match the spec exactly or upload is rejected:
// width = 2·bleed(0.125") + 2·trim(8.5") + spine(pages × 0.002252"); height = trim(11") + 2·bleed.
test("cover renders at exact KDP wrap dimensions", async () => {
  const pageCount = 61;
  const bytes = await renderCoverPdf({
    title: "Sudoku Puzzle Book Vol. 1",
    subtitle: "50 Easy to Hard Puzzles for Adults with Solutions",
    author: "ai_ibaraki",
    backBlurb: "Fifty hand-checked sudoku puzzles with unique solutions.",
    pageCount,
  });
  const page = (await PDFDocument.load(bytes)).getPage(0);
  const spine = pageCount * 0.002252 * 72;
  const expW = 2 * 9 + 2 * 612 + spine;
  const expH = 792 + 18;
  assert.ok(Math.abs(page.getWidth() - expW) < 0.5, `width ${page.getWidth()} ≠ ${expW}`);
  assert.ok(Math.abs(page.getHeight() - expH) < 0.5, `height ${page.getHeight()} ≠ ${expH}`);
});
