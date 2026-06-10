// KDP listing metadata generation for a sudoku book.
import type { Difficulty } from "./sudoku.js";

export interface KdpMetadata {
  title: string;
  subtitle: string;
  description: string;
  author: string;
  keywords: string[]; // KDP allows up to 7
  bisacCategories: string[]; // 2 categories
  trimSize: string;
  pageCount: number;
  interiorPath: string;
  language: string;
  puzzleCount: number;
  difficulty: string;
}

export interface MetadataInput {
  author?: string;
  puzzleCount: number;
  difficulty: Difficulty | "mixed";
  pageCount: number;
  interiorPath: string;
  bookNumber?: number;
}

const DEFAULT_AUTHOR = "Puzzle Press";

function difficultyLabel(d: Difficulty | "mixed"): string {
  switch (d) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Hard";
    case "mixed":
      return "Easy to Hard";
  }
}

export function buildMetadata(input: MetadataInput): KdpMetadata {
  const author = input.author ?? DEFAULT_AUTHOR;
  const diffLabel = difficultyLabel(input.difficulty);
  const vol = input.bookNumber ? ` Vol. ${input.bookNumber}` : "";

  const title = `Sudoku Puzzle Book${vol}`;
  const subtitle = `${input.puzzleCount} ${diffLabel} Puzzles for Adults with Solutions`;

  const description = [
    `Sharpen your mind with ${input.puzzleCount} hand-checked sudoku puzzles ranging from ${diffLabel.toLowerCase()} difficulty.`,
    `Every puzzle is guaranteed to have one unique solution, so you can solve with confidence.`,
    `Printed one puzzle per page on large, easy-to-read grids with plenty of room for notes, plus a complete answer key in the back.`,
    `A perfect gift for puzzle lovers, commuters, and anyone who wants to keep their brain active.`,
  ].join(" ");

  const keywords = [
    "sudoku puzzle book",
    "sudoku for adults",
    `${diffLabel.toLowerCase()} sudoku`,
    "brain games",
    "logic puzzles",
    "large print sudoku",
    "puzzle book with solutions",
  ];

  const bisacCategories = [
    "Games & Activities / Puzzles",
    "Games & Activities / Logic & Brain Teasers",
  ];

  return {
    title,
    subtitle,
    description,
    author,
    keywords,
    bisacCategories,
    trimSize: "8.5 x 11 in",
    pageCount: input.pageCount,
    interiorPath: input.interiorPath,
    language: "English",
    puzzleCount: input.puzzleCount,
    difficulty: diffLabel,
  };
}
