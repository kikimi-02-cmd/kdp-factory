// Sudoku generator / solver.
// A grid is a flat array of 81 numbers (0 = empty, 1..9 = filled).
// Index = row * 9 + col.

export type Grid = number[];
export type Difficulty = "easy" | "medium" | "hard";

const SIZE = 9;
const CELLS = 81;

/** Target number of given (pre-filled) cells per difficulty. */
const GIVENS: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Returns true if placing `val` at index `idx` keeps the grid valid. */
function canPlace(grid: Grid, idx: number, val: number): boolean {
  const row = Math.floor(idx / SIZE);
  const col = idx % SIZE;
  // row + column
  for (let k = 0; k < SIZE; k++) {
    if (grid[row * SIZE + k] === val) return false;
    if (grid[k * SIZE + col] === val) return false;
  }
  // 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[(boxRow + r) * SIZE + (boxCol + c)] === val) return false;
    }
  }
  return true;
}

/**
 * Fill the grid in place using randomized backtracking.
 * Returns true once a complete valid solution is found.
 */
function fill(grid: Grid, pos = 0): boolean {
  if (pos >= CELLS) return true;
  if (grid[pos] !== 0) return fill(grid, pos + 1);
  const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const val of candidates) {
    if (canPlace(grid, pos, val)) {
      grid[pos] = val;
      if (fill(grid, pos + 1)) return true;
      grid[pos] = 0;
    }
  }
  return false;
}

/** Generate a complete, valid, randomized solution grid. */
export function generateSolved(): Grid {
  const grid: Grid = new Array(CELLS).fill(0);
  fill(grid);
  return grid;
}

/**
 * Count solutions of a puzzle, stopping early once `limit` is reached.
 * Uses the cell with the value-tracking backtracker. Returns the count
 * (capped at `limit`).
 */
export function countSolutions(grid: Grid, limit = 2): number {
  const work = grid.slice();
  let count = 0;

  function recurse(): void {
    if (count >= limit) return;
    // find first empty cell
    let idx = -1;
    for (let i = 0; i < CELLS; i++) {
      if (work[i] === 0) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      count++;
      return;
    }
    for (let val = 1; val <= SIZE; val++) {
      if (count >= limit) return;
      if (canPlace(work, idx, val)) {
        work[idx] = val;
        recurse();
        work[idx] = 0;
      }
    }
  }

  recurse();
  return count;
}

/**
 * Solve a puzzle and return the (first) full solution, or null if unsolvable.
 */
export function solve(grid: Grid): Grid | null {
  const work = grid.slice();
  if (fill(work, 0)) return work;
  return null;
}

/**
 * Build a puzzle from a solved grid by removing cells while preserving a
 * unique solution. Removal is attempted in random order. Difficulty controls
 * the target number of remaining givens; we stop removing once we hit the
 * target (or can't remove more without breaking uniqueness).
 */
export function makePuzzle(difficulty: Difficulty = "medium"): {
  puzzle: Grid;
  solution: Grid;
  givens: number;
  difficulty: Difficulty;
} {
  const solution = generateSolved();
  const puzzle = solution.slice();
  const target = GIVENS[difficulty];

  const order = shuffle([...Array(CELLS).keys()]);
  let filled = CELLS;

  for (const idx of order) {
    if (filled <= target) break;
    const backup = puzzle[idx];
    if (backup === 0) continue;
    puzzle[idx] = 0;
    // If removing breaks uniqueness, put it back.
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[idx] = backup;
    } else {
      filled--;
    }
  }

  return { puzzle, solution, givens: filled, difficulty };
}

/** Validate that a completed grid satisfies all sudoku constraints. */
export function isValidSolution(grid: Grid): boolean {
  if (grid.length !== CELLS) return false;
  const seen = (vals: number[]): boolean => {
    const set = new Set<number>();
    for (const v of vals) {
      if (v < 1 || v > 9) return false;
      if (set.has(v)) return false;
      set.add(v);
    }
    return set.size === 9;
  };
  for (let r = 0; r < SIZE; r++) {
    const row: number[] = [];
    const col: number[] = [];
    for (let c = 0; c < SIZE; c++) {
      row.push(grid[r * SIZE + c]);
      col.push(grid[c * SIZE + r]);
    }
    if (!seen(row) || !seen(col)) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box: number[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          box.push(grid[(br * 3 + r) * SIZE + (bc * 3 + c)]);
        }
      }
      if (!seen(box)) return false;
    }
  }
  return true;
}
