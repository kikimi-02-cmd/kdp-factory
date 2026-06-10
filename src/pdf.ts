// Render a sudoku puzzle book interior to a print-ready PDF using pdf-lib.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Grid, Difficulty } from "./sudoku.js";

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
  const solGridSize = (PAGE_W - 2 * MARGIN - 0.4 * 72) / COLS - 12;
  const colGap = (PAGE_W - 2 * MARGIN - COLS * solGridSize) / (COLS + 1);
  const rowAreaH = (PAGE_H - 2 * MARGIN - 40) / ROWS;

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
