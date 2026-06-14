import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeWordSearch,
  findWord,
  isValidWordSearch,
  WORD_BANK_NAMES,
} from "./wordsearch.js";

for (const difficulty of ["easy", "medium", "hard"] as const) {
  test(`makeWordSearch(${difficulty}) is internally consistent`, () => {
    const puzzle = makeWordSearch(difficulty);
    assert.equal(puzzle.grid.length, puzzle.size * puzzle.size);
    assert.ok(puzzle.words.length > 0, "should place at least one word");
    assert.ok(isValidWordSearch(puzzle), "puzzle must pass integrity check");

    // every placed word is findable by an independent scan
    for (const w of puzzle.words) {
      const hits = findWord(puzzle.grid, puzzle.size, w);
      assert.ok(hits.length >= 1, `${w} must be findable in the grid`);
    }

    // every grid cell is a single uppercase letter
    assert.ok(
      puzzle.grid.every((c) => c.length === 1 && c >= "A" && c <= "Z"),
      "all cells are A-Z",
    );
  });
}

test("makeWordSearch honors a requested theme", () => {
  const theme = WORD_BANK_NAMES[0];
  const puzzle = makeWordSearch("medium", theme);
  assert.equal(puzzle.theme, theme);
});

test("recorded placements actually spell their words", () => {
  const puzzle = makeWordSearch("hard");
  for (const p of puzzle.placements) {
    let spelled = "";
    for (let k = 0; k < p.word.length; k++) {
      spelled += puzzle.grid[(p.row + p.dRow * k) * puzzle.size + (p.col + p.dCol * k)];
    }
    assert.equal(spelled, p.word);
  }
});

test("two generated puzzles differ (randomized)", () => {
  const a = makeWordSearch("medium", WORD_BANK_NAMES[0]);
  const b = makeWordSearch("medium", WORD_BANK_NAMES[0]);
  assert.notDeepEqual(a.grid, b.grid);
});
