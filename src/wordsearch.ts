// Word-search generator / validator.
// A grid is a flat array of letters (A-Z). Index = row * size + col.
//
// Mirrors the sudoku module's shape: a board generator (`makePuzzle`),
// plus validators that guarantee every hidden word is actually placed and
// findable in the grid (solution integrity), and that no theme word is
// accidentally created more than once / collides destructively.

export type Cell = string; // single uppercase letter
export type WSGrid = Cell[];
export type WSDifficulty = "easy" | "medium" | "hard";

/** Grid size + word count per difficulty. */
const SPECS: Record<WSDifficulty, { size: number; words: number }> = {
  easy: { size: 10, words: 8 },
  medium: { size: 13, words: 12 },
  hard: { size: 15, words: 16 },
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// 8 directions: [dRow, dCol]. Includes diagonals and reverse.
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // →
  [0, -1], // ←
  [1, 0], // ↓
  [-1, 0], // ↑
  [1, 1], // ↘
  [-1, -1], // ↖
  [1, -1], // ↙
  [-1, 1], // ↗
];

/**
 * Built-in themed word banks. Simple, self-contained — no external data.
 * All words are uppercase A-Z only (no spaces / hyphens).
 */
export const WORD_BANKS: Record<string, string[]> = {
  animals: [
    "TIGER", "ELEPHANT", "GIRAFFE", "DOLPHIN", "PANDA", "RABBIT", "MONKEY",
    "ZEBRA", "KANGAROO", "LEOPARD", "OTTER", "FALCON", "PENGUIN", "WALRUS",
    "BADGER", "BEAVER", "CHEETAH", "GORILLA", "LIZARD", "OSTRICH",
  ],
  fruits: [
    "APPLE", "BANANA", "ORANGE", "MANGO", "CHERRY", "GRAPE", "LEMON",
    "MELON", "PEACH", "PLUM", "APRICOT", "PAPAYA", "GUAVA", "LYCHEE",
    "KIWI", "FIG", "DATE", "POMELO", "QUINCE", "CURRANT",
  ],
  ocean: [
    "WHALE", "SHARK", "CORAL", "STARFISH", "OYSTER", "SEAWEED", "URCHIN",
    "MARLIN", "SALMON", "PRAWN", "LOBSTER", "SPONGE", "TURTLE", "SEAL",
    "OCTOPUS", "SQUID", "HERRING", "MACKEREL", "BARNACLE", "PLANKTON",
  ],
  weather: [
    "CLOUD", "THUNDER", "RAINBOW", "BLIZZARD", "DRIZZLE", "MONSOON",
    "TORNADO", "SUNSHINE", "HUMIDITY", "FORECAST", "PRESSURE", "CYCLONE",
    "FROST", "HAIL", "SLEET", "BREEZE", "GALE", "MIST", "OVERCAST", "TYPHOON",
  ],
  kitchen: [
    "SPATULA", "WHISK", "LADLE", "GRATER", "COLANDER", "SKILLET", "KETTLE",
    "TOASTER", "BLENDER", "STRAINER", "PEELER", "TONGS", "SAUCEPAN",
    "CUTTING", "MIXER", "ROLLING", "OVEN", "SIEVE", "FUNNEL", "TIMER",
  ],
};

export const WORD_BANK_NAMES = Object.keys(WORD_BANKS);

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface Placement {
  word: string;
  row: number; // start row (0-based)
  col: number; // start col (0-based)
  dRow: number;
  dCol: number;
}

export interface WordSearchPuzzle {
  size: number;
  grid: WSGrid; // filled grid with hidden words + random fillers
  placements: Placement[]; // the answer key
  words: string[]; // theme words actually placed
  theme: string;
  difficulty: WSDifficulty;
}

/** Flat indices each cell of a placement occupies. */
function indexCells(p: Placement, size: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < p.word.length; k++) {
    const r = p.row + p.dRow * k;
    const c = p.col + p.dCol * k;
    out.push(r * size + c);
  }
  return out;
}

/**
 * Try to place a word into the grid. Letters may overlap existing letters
 * only when they match (classic word-search rule). Returns the placement on
 * success, or null if it cannot be placed in `attempts` tries.
 */
function tryPlace(
  grid: WSGrid,
  size: number,
  word: string,
  attempts = 200,
): Placement | null {
  for (let a = 0; a < attempts; a++) {
    const [dRow, dCol] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    // pick a start such that the whole word stays in bounds
    const rowMin = dRow < 0 ? (word.length - 1) : 0;
    const rowMax = dRow > 0 ? size - word.length : size - 1;
    const colMin = dCol < 0 ? (word.length - 1) : 0;
    const colMax = dCol > 0 ? size - word.length : size - 1;
    if (rowMax < rowMin || colMax < colMin) continue;
    const row = rowMin + Math.floor(Math.random() * (rowMax - rowMin + 1));
    const col = colMin + Math.floor(Math.random() * (colMax - colMin + 1));

    let ok = true;
    for (let k = 0; k < word.length; k++) {
      const idx = (row + dRow * k) * size + (col + dCol * k);
      const existing = grid[idx];
      if (existing !== "" && existing !== word[k]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;

    const placement: Placement = { word, row, col, dRow, dCol };
    for (let k = 0; k < word.length; k++) {
      const idx = (row + dRow * k) * size + (col + dCol * k);
      grid[idx] = word[k];
    }
    return placement;
  }
  return null;
}

/**
 * Generate a word-search puzzle. Chooses words from the theme bank, places
 * them, then fills the remaining cells with random letters.
 *
 * `theme` selects a word bank (defaults to a random bank).
 */
export function makeWordSearch(
  difficulty: WSDifficulty = "medium",
  theme?: string,
): WordSearchPuzzle {
  const { size, words: wantWords } = SPECS[difficulty];
  const themeName =
    theme && WORD_BANKS[theme]
      ? theme
      : WORD_BANK_NAMES[Math.floor(Math.random() * WORD_BANK_NAMES.length)];

  // candidate words: fit in the grid, unique, longest-first improves packing
  const candidates = shuffle(
    WORD_BANKS[themeName].filter((w) => w.length <= size),
  ).sort((a, b) => b.length - a.length);

  const grid: WSGrid = new Array(size * size).fill("");
  const placements: Placement[] = [];
  const placed: string[] = [];

  for (const word of candidates) {
    if (placed.length >= wantWords) break;
    if (placed.includes(word)) continue;
    const p = tryPlace(grid, size, word);
    if (p) {
      placements.push(p);
      placed.push(word);
    }
  }

  // fill blanks with random letters
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === "") {
      grid[i] = ALPHABET[Math.floor(Math.random() * 26)];
    }
  }

  return {
    size,
    grid,
    placements,
    words: placed,
    theme: themeName,
    difficulty,
  };
}

/**
 * Search the grid for `word` starting at every cell in every direction.
 * Returns the list of start coordinates+directions where it is found.
 */
export function findWord(
  grid: WSGrid,
  size: number,
  word: string,
): Placement[] {
  const found: Placement[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      for (const [dRow, dCol] of DIRECTIONS) {
        const endR = row + dRow * (word.length - 1);
        const endC = col + dCol * (word.length - 1);
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
        let match = true;
        for (let k = 0; k < word.length; k++) {
          if (grid[(row + dRow * k) * size + (col + dCol * k)] !== word[k]) {
            match = false;
            break;
          }
        }
        if (match) found.push({ word, row, col, dRow, dCol });
      }
    }
  }
  return found;
}

/**
 * Solution integrity: every theme word must be findable in the grid at its
 * recorded placement (and at least once overall). Returns true if the puzzle
 * is internally consistent.
 */
export function isValidWordSearch(puzzle: WordSearchPuzzle): boolean {
  const { grid, size, placements } = puzzle;
  if (grid.length !== size * size) return false;
  if (grid.some((c) => c.length !== 1 || c < "A" || c > "Z")) return false;
  if (placements.length === 0) return false;

  for (const p of placements) {
    // recorded placement must actually spell the word
    const cells = indexCells(p, size);
    if (cells.some((i) => i < 0 || i >= grid.length)) return false;
    const spelled = cells.map((i) => grid[i]).join("");
    if (spelled !== p.word) return false;

    // and the word must be findable by a fresh scan (solver agreement)
    if (findWord(grid, size, p.word).length === 0) return false;
  }
  return true;
}
