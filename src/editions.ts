// Edition catalog — distinct, sellable SKUs so a batch isn't N identical "Vol. N"
// books (which KDP flags as duplicate/low-quality and which don't differentiate
// in search). Each edition targets a different keyword / buyer. `--catalog` walks
// these; repeats beyond the list become Vol. 2, Vol. 3 of the same edition (a
// legitimate series), never a byte-identical duplicate.
import type { Difficulty } from "./sudoku.js";
import type { WSDifficulty } from "./wordsearch.js";

export interface Edition {
  key: string; // stable id, also the per-edition Vol. counter key
  category: "sudoku" | "word-search";
  difficulty: Difficulty | WSDifficulty | "mixed";
  titleNoun: string; // marketing title without the Vol. suffix
  audience?: string; // sudoku: "Beginners" | "Seniors" | "Experts" ...
  largePrint?: boolean;
  theme?: string; // word-search: single WORD_BANK key (animals/fruits/ocean/weather/kitchen)
  themeLabel?: string; // word-search: human label, e.g. "Animal"
}

// 8 sudoku + 5 word-search = 13 distinct SKUs out of the box.
export const EDITIONS: Edition[] = [
  // ── sudoku: differentiate by difficulty × audience × large-print ──
  { key: "sudoku-easy-beginners", category: "sudoku", difficulty: "easy", titleNoun: "Easy Sudoku for Beginners", audience: "Beginners" },
  { key: "sudoku-medium-adults", category: "sudoku", difficulty: "medium", titleNoun: "Sudoku Puzzle Book", audience: "Adults" },
  { key: "sudoku-hard-experts", category: "sudoku", difficulty: "hard", titleNoun: "Hard Sudoku for Experts", audience: "Experts" },
  { key: "sudoku-mixed", category: "sudoku", difficulty: "mixed", titleNoun: "Sudoku Easy to Hard", audience: "Adults" },
  { key: "sudoku-lp-seniors-easy", category: "sudoku", difficulty: "easy", titleNoun: "Easy Large Print Sudoku for Seniors", audience: "Seniors", largePrint: true },
  { key: "sudoku-lp-medium", category: "sudoku", difficulty: "medium", titleNoun: "Large Print Sudoku", audience: "Adults", largePrint: true },
  { key: "sudoku-lp-hard", category: "sudoku", difficulty: "hard", titleNoun: "Large Print Hard Sudoku", audience: "Adults", largePrint: true },
  { key: "sudoku-lp-mixed-seniors", category: "sudoku", difficulty: "mixed", titleNoun: "Large Print Sudoku for Seniors", audience: "Seniors", largePrint: true },
  // ── word-search: differentiate by theme ──
  { key: "ws-animals", category: "word-search", difficulty: "mixed", titleNoun: "Animal Word Search", theme: "animals", themeLabel: "Animal" },
  { key: "ws-fruits", category: "word-search", difficulty: "mixed", titleNoun: "Fruit Word Search", theme: "fruits", themeLabel: "Fruit" },
  { key: "ws-ocean", category: "word-search", difficulty: "mixed", titleNoun: "Ocean Word Search", theme: "ocean", themeLabel: "Ocean" },
  { key: "ws-weather", category: "word-search", difficulty: "mixed", titleNoun: "Weather Word Search", theme: "weather", themeLabel: "Weather" },
  { key: "ws-kitchen", category: "word-search", difficulty: "mixed", titleNoun: "Kitchen Word Search", theme: "kitchen", themeLabel: "Kitchen" },
];

export function editionsFor(category?: string): Edition[] {
  if (!category) return EDITIONS;
  return EDITIONS.filter((e) => e.category === category);
}
