import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateSolved,
  makePuzzle,
  solve,
  countSolutions,
  isValidSolution,
} from "./sudoku.js";

test("generateSolved produces a valid complete grid", () => {
  const grid = generateSolved();
  assert.equal(grid.length, 81);
  assert.ok(grid.every((v) => v >= 1 && v <= 9));
  assert.ok(isValidSolution(grid), "solved grid must satisfy all constraints");
});

test("generateSolved is randomized (two grids differ)", () => {
  const a = generateSolved();
  const b = generateSolved();
  assert.notDeepEqual(a, b);
});

for (const difficulty of ["easy", "medium", "hard"] as const) {
  test(`makePuzzle(${difficulty}) has a unique solution that matches`, () => {
    const { puzzle, solution, givens } = makePuzzle(difficulty);
    assert.equal(puzzle.length, 81);
    assert.ok(isValidSolution(solution), "embedded solution must be valid");

    // unique solution
    assert.equal(countSolutions(puzzle, 2), 1, "puzzle must have exactly one solution");

    // solving reproduces the solution
    const solved = solve(puzzle);
    assert.ok(solved, "puzzle must be solvable");
    assert.deepEqual(solved, solution, "solved grid must match the original solution");

    // puzzle is a subset of solution (givens match, blanks are 0)
    for (let i = 0; i < 81; i++) {
      if (puzzle[i] !== 0) assert.equal(puzzle[i], solution[i]);
    }

    // some cells were actually removed
    assert.ok(givens < 81, "some givens should have been removed");
    assert.ok(givens >= 17, "a unique sudoku needs at least 17 givens");
  });
}

test("countSolutions caps at the given limit", () => {
  // empty grid has many solutions; ensure it stops at 2
  const empty = new Array(81).fill(0);
  assert.equal(countSolutions(empty, 2), 2);
});
