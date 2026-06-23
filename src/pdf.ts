// Render a sudoku / word-search puzzle book interior to a print-ready PDF
// using pdf-lib.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Grid, Difficulty } from "./sudoku.js";
import type { WordSearchPuzzle, WSDifficulty } from "./wordsearch.js";

// KDP 8.5" x 11" trim at 72 dpi.
const PAGE_W = 8.5 * 72; // 612
const PAGE_H = 11 * 72; // 792
const MARGIN = 0.5 * 72; // 36 pt inner/outer margin

const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.45, 0.45, 0.45);

export interface BookPuzzle {
  index: number; // 1-based puzzle number
  difficulty: Difficulty;
  puzzle: Grid;
  solution: Grid;
}

export interface BookSpec {
  title: string;
  subtitle: string;
  author: string;
  puzzles: BookPuzzle[];
}

interface GridLayout {
  x: number; // left
  y: number; // bottom
  size: number; // total width/height of the 9x9 grid
}

function drawGrid(
  page: PDFPage,
  grid: Grid,
  font: PDFFont,
  layout: GridLayout,
): void {
  const { x, y, size } = layout;
  const cell = size / 9;
  const thin = 0.75;
  const thick = 2.0;

  // grid lines
  for (let i = 0; i <= 9; i++) {
    const isBox = i % 3 === 0;
    const lw = isBox ? thick : thin;
    // vertical
    page.drawLine({
      start: { x: x + i * cell, y },
      end: { x: x + i * cell, y: y + size },
      thickness: lw,
      color: BLACK,
    });
    // horizontal
    page.drawLine({
      start: { x, y: y + i * cell },
      end: { x: x + size, y: y + i * cell },
      thickness: lw,
      color: BLACK,
    });
  }

  // digits
  const fontSize = cell * 0.55;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r * 9 + c];
      if (val === 0) continue;
      const text = String(val);
      const tw = font.widthOfTextAtSize(text, fontSize);
      const th = font.heightAtSize(fontSize);
      // row 0 is at top of grid; PDF y grows upward.
      const cx = x + c * cell + (cell - tw) / 2;
      const cy = y + size - (r + 1) * cell + (cell - th) / 2 + th * 0.18;
      page.drawText(text, { x: cx, y: cy, size: fontSize, font, color: BLACK });
    }
  }
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = BLACK,
): void {
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_W - tw) / 2, y, size, font, color });
}

/**
 * Build the full interior PDF and return the bytes.
 */
export async function renderBookPdf(spec: BookSpec): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // ---- Title page ----
  const title = doc.addPage([PAGE_W, PAGE_H]);
  drawCenteredText(title, spec.title, PAGE_H - 3 * 72, fontBold, 30);
  if (spec.subtitle) {
    drawCenteredText(title, spec.subtitle, PAGE_H - 3.7 * 72, font, 16, GRAY);
  }
  drawCenteredText(title, `${spec.puzzles.length} Puzzles`, PAGE_H / 2, font, 14, GRAY);
  drawCenteredText(title, spec.author, MARGIN + 36, font, 12, GRAY);

  // ---- Puzzle pages: 1 grid per page ----
  const gridSize = PAGE_W - 2 * MARGIN - 1.0 * 72; // leave room, square grid
  const gx = (PAGE_W - gridSize) / 2;
  for (const p of spec.puzzles) {
    const page = doc.addPage([PAGE_W, PAGE_H]);
    drawCenteredText(page, `Puzzle ${p.index}`, PAGE_H - MARGIN - 30, fontBold, 20);
    drawCenteredText(
      page,
      p.difficulty.toUpperCase(),
      PAGE_H - MARGIN - 52,
      font,
      11,
      GRAY,
    );
    const gy = PAGE_H - MARGIN - 80 - gridSize;
    drawGrid(page, p.puzzle, font, { x: gx, y: gy, size: gridSize });
  }

  // ---- Solutions section ----
  const solDivider = doc.addPage([PAGE_W, PAGE_H]);
  drawCenteredText(solDivider, "Solutions", PAGE_H / 2, fontBold, 28);

  // 6 solutions per page (2 cols x 3 rows).
  const COLS = 2;
  const ROWS = 3;
  const perPage = COLS * ROWS;
  const rowAreaH = (PAGE_H - 2 * MARGIN - 40) / ROWS;
  // Grid must fit BOTH the column width AND the row height. Previously this was
  // sized by width only (≈244pt), but each row only gets ≈227pt tall, so square
  // grids bled ~37pt into the row below → solutions overlapped. Constrain to the
  // smaller of the two. `LABEL_H` = "#n" label (14) + gap (6) + padding (6).
  const LABEL_H = 26;
  const widthBased = (PAGE_W - 2 * MARGIN - 0.4 * 72) / COLS - 12;
  const heightBased = rowAreaH - LABEL_H;
  const solGridSize = Math.min(widthBased, heightBased);
  // Guard: a row's content must never exceed its allotted height (overlap = unsellable book).
  if (solGridSize + LABEL_H > rowAreaH + 0.5) {
    throw new Error(
      `solution grid overflow: grid ${solGridSize.toFixed(1)} + label ${LABEL_H} > row ${rowAreaH.toFixed(1)}`,
    );
  }
  const colGap = (PAGE_W - 2 * MARGIN - COLS * solGridSize) / (COLS + 1);

  for (let i = 0; i < spec.puzzles.length; i += perPage) {
    const page = doc.addPage([PAGE_W, PAGE_H]);
    drawCenteredText(page, "Solutions", PAGE_H - MARGIN - 24, fontBold, 16);
    const slice = spec.puzzles.slice(i, i + perPage);
    slice.forEach((p, k) => {
      const col = k % COLS;
      const row = Math.floor(k / COLS);
      const x = MARGIN + colGap + col * (solGridSize + colGap);
      const topY = PAGE_H - MARGIN - 40 - row * rowAreaH;
      const labelY = topY - 14;
      page.drawText(`#${p.index}`, {
        x,
        y: labelY,
        size: 9,
        font,
        color: GRAY,
      });
      const gyTop = labelY - 6 - solGridSize;
      drawGrid(page, p.solution, font, { x, y: gyTop, size: solGridSize });
    });
  }

  return doc.save();
}

// ---------------------------------------------------------------------------
// Full-wrap paperback cover (KDP spec)
// ---------------------------------------------------------------------------

export interface CoverSpec {
  title: string;
  subtitle: string;
  author: string;
  backBlurb: string;
  pageCount: number;
  paper?: "white" | "cream"; // interior paper → spine thickness
  accentIndex?: number; // rotate palette for batch variety
}

// KDP paperback wrap math (https://kdp.amazon.com/help → cover dimensions):
//   bleed 0.125" all sides; spine = pageCount × per-page thickness.
//   B&W on white = 0.002252"/page, cream = 0.0025"/page.
//   full width  = 2·bleed + 2·trimW + spine ; full height = trimH + 2·bleed.
//   Spine text is only allowed at ≥100 pages, so we leave the spine blank here.
const COVER_PALETTES = [
  { bg: rgb(0.07, 0.11, 0.21), ink: rgb(0.96, 0.94, 0.87), accent: rgb(0.88, 0.6, 0.2) }, // navy / gold
  { bg: rgb(0.09, 0.17, 0.15), ink: rgb(0.96, 0.95, 0.9), accent: rgb(0.85, 0.42, 0.38) }, // forest / coral
  { bg: rgb(0.15, 0.1, 0.2), ink: rgb(0.96, 0.94, 0.92), accent: rgb(0.5, 0.66, 0.84) }, // plum / blue
];

function wrapLines(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = trial;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function renderCoverPdf(spec: CoverSpec): Promise<Uint8Array> {
  const BLEED = 0.125 * 72;
  const TRIM_W = PAGE_W; // 8.5"
  const TRIM_H = PAGE_H; // 11"
  const perPage = spec.paper === "cream" ? 0.0025 : 0.002252;
  const spine = spec.pageCount * perPage * 72;
  const fullW = 2 * BLEED + 2 * TRIM_W + spine;
  const fullH = TRIM_H + 2 * BLEED;
  const pal = COVER_PALETTES[(spec.accentIndex ?? 0) % COVER_PALETTES.length];
  const SAFE = 0.25 * 72; // keep text ≥0.25" from trim edges

  const doc = await PDFDocument.create();
  const page = doc.addPage([fullW, fullH]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: fullW, height: fullH, color: pal.bg });

  // Front cover = right trim panel.
  const frontX = BLEED + TRIM_W + spine;
  const fLeft = frontX + SAFE;
  const fRight = frontX + TRIM_W - SAFE;
  const fW = fRight - fLeft;

  // accent bands top & bottom of front
  page.drawRectangle({ x: frontX, y: fullH - BLEED - 90, width: TRIM_W, height: 10, color: pal.accent });
  page.drawRectangle({ x: frontX, y: BLEED + 80, width: TRIM_W, height: 10, color: pal.accent });

  // Title (wrapped, bold, large) centered in upper third
  const titleSize = 46;
  const tLines = wrapLines(spec.title, fontBold, titleSize, fW);
  let ty = fullH - BLEED - 200;
  for (const ln of tLines) {
    const w = fontBold.widthOfTextAtSize(ln, titleSize);
    page.drawText(ln, { x: frontX + (TRIM_W - w) / 2, y: ty, size: titleSize, font: fontBold, color: pal.ink });
    ty -= titleSize * 1.12;
  }

  // Subtitle
  const subSize = 18;
  const sLines = wrapLines(spec.subtitle, font, subSize, fW);
  ty -= 24;
  for (const ln of sLines) {
    const w = font.widthOfTextAtSize(ln, subSize);
    page.drawText(ln, { x: frontX + (TRIM_W - w) / 2, y: ty, size: subSize, font, color: pal.accent });
    ty -= subSize * 1.3;
  }

  // Author (bottom of front)
  const aSize = 20;
  const aw = fontBold.widthOfTextAtSize(spec.author, aSize);
  page.drawText(spec.author, { x: frontX + (TRIM_W - aw) / 2, y: BLEED + 110, size: aSize, font: fontBold, color: pal.ink });

  // Back cover = left trim panel: blurb.
  const bLeft = BLEED + SAFE;
  const bSize = 13;
  const bLines = wrapLines(spec.backBlurb, font, bSize, TRIM_W - 2 * SAFE);
  let by = fullH - BLEED - SAFE - 40;
  for (const ln of bLines) {
    page.drawText(ln, { x: bLeft, y: by, size: bSize, font, color: pal.ink });
    by -= bSize * 1.5;
  }

  return doc.save();
}

// ---------------------------------------------------------------------------
// Word-search interior
// ---------------------------------------------------------------------------

export interface WordSearchBookPuzzle {
  index: number; // 1-based puzzle number
  puzzle: WordSearchPuzzle;
}

export interface WordSearchBookSpec {
  title: string;
  subtitle: string;
  author: string;
  puzzles: WordSearchBookPuzzle[];
}

function drawLetterGrid(
  page: PDFPage,
  puzzle: WordSearchPuzzle,
  font: PDFFont,
  layout: GridLayout,
): void {
  const { x, y, size } = layout;
  const n = puzzle.size;
  const cell = size / n;
  const fontSize = Math.min(cell * 0.6, 18);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const letter = puzzle.grid[r * n + c];
      const tw = font.widthOfTextAtSize(letter, fontSize);
      const th = font.heightAtSize(fontSize);
      const cx = x + c * cell + (cell - tw) / 2;
      // row 0 at top
      const cy = y + size - (r + 1) * cell + (cell - th) / 2 + th * 0.18;
      page.drawText(letter, { x: cx, y: cy, size: fontSize, font, color: BLACK });
    }
  }
}

/** Draw the theme word list under a grid; returns the y reached. */
function drawWordList(
  page: PDFPage,
  words: string[],
  font: PDFFont,
  startY: number,
): void {
  const cols = 4;
  const colW = (PAGE_W - 2 * MARGIN) / cols;
  const rowH = 16;
  words.forEach((w, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    page.drawText(w, {
      x: MARGIN + col * colW,
      y: startY - row * rowH,
      size: 11,
      font,
      color: BLACK,
    });
  });
}

export async function renderWordSearchPdf(
  spec: WordSearchBookSpec,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // ---- Title page ----
  const title = doc.addPage([PAGE_W, PAGE_H]);
  drawCenteredText(title, spec.title, PAGE_H - 3 * 72, fontBold, 30);
  if (spec.subtitle) {
    drawCenteredText(title, spec.subtitle, PAGE_H - 3.7 * 72, font, 16, GRAY);
  }
  drawCenteredText(title, `${spec.puzzles.length} Puzzles`, PAGE_H / 2, font, 14, GRAY);
  drawCenteredText(title, spec.author, MARGIN + 36, font, 12, GRAY);

  // ---- Puzzle pages: 1 grid + word list per page ----
  const gridSize = PAGE_W - 2 * MARGIN - 1.0 * 72;
  const gx = (PAGE_W - gridSize) / 2;
  for (const p of spec.puzzles) {
    const page = doc.addPage([PAGE_W, PAGE_H]);
    drawCenteredText(page, `Puzzle ${p.index}`, PAGE_H - MARGIN - 30, fontBold, 20);
    drawCenteredText(
      page,
      `${p.puzzle.theme.toUpperCase()} • ${p.puzzle.difficulty.toUpperCase()}`,
      PAGE_H - MARGIN - 52,
      font,
      11,
      GRAY,
    );
    const gy = PAGE_H - MARGIN - 80 - gridSize;
    drawLetterGrid(page, p.puzzle, font, { x: gx, y: gy, size: gridSize });
    drawWordList(page, p.puzzle.words, font, gy - 24);
  }

  // ---- Solutions section ----
  const solDivider = doc.addPage([PAGE_W, PAGE_H]);
  drawCenteredText(solDivider, "Solutions", PAGE_H / 2, fontBold, 28);

  // List each puzzle's words + start coordinates (1-based row,col) + direction.
  const dirLabel = (dr: number, dc: number): string => {
    const v = dr === 0 ? "" : dr > 0 ? "down" : "up";
    const h = dc === 0 ? "" : dc > 0 ? "right" : "left";
    return [v, h].filter(Boolean).join("-") || "?";
  };
  let page = doc.addPage([PAGE_W, PAGE_H]);
  drawCenteredText(page, "Solutions", PAGE_H - MARGIN - 24, fontBold, 16);
  let yCursor = PAGE_H - MARGIN - 50;
  const lineH = 13;
  for (const p of spec.puzzles) {
    // estimate block height
    const block = lineH * (p.puzzle.placements.length + 2);
    if (yCursor - block < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      drawCenteredText(page, "Solutions", PAGE_H - MARGIN - 24, fontBold, 16);
      yCursor = PAGE_H - MARGIN - 50;
    }
    page.drawText(`Puzzle ${p.index}`, {
      x: MARGIN,
      y: yCursor,
      size: 12,
      font: fontBold,
      color: BLACK,
    });
    yCursor -= lineH + 2;
    for (const pl of p.puzzle.placements) {
      page.drawText(
        `${pl.word}  (row ${pl.row + 1}, col ${pl.col + 1}, ${dirLabel(pl.dRow, pl.dCol)})`,
        { x: MARGIN + 12, y: yCursor, size: 10, font, color: GRAY },
      );
      yCursor -= lineH;
    }
    yCursor -= lineH;
  }

  return doc.save();
}
