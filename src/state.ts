// State write-back layer for kdp-factory.
//
// Records each generated book into state/kdp-factory.json so the factory has a
// durable ledger of what has been produced. This layer ONLY persists state — it
// does not generate, and (per repo guardrails) it never publishes anything.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface BookRecord {
  id: string;
  category: string;
  title: string;
  created_at: string; // ISO timestamp
  output_path: string; // relative to repo root, e.g. output/sudoku/<id>
  puzzle_count: number;
  page_count: number;
  difficulty: string;
}

export interface FactoryState {
  version: number;
  books: BookRecord[];
  last_batch_at: string | null;
}

const DEFAULT_STATE: FactoryState = {
  version: 1,
  books: [],
  last_batch_at: null,
};

export async function readState(statePath: string): Promise<FactoryState> {
  try {
    const raw = await readFile(statePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<FactoryState>;
    return {
      version: parsed.version ?? 1,
      books: Array.isArray(parsed.books) ? (parsed.books as BookRecord[]) : [],
      last_batch_at: parsed.last_batch_at ?? null,
    };
  } catch {
    return { ...DEFAULT_STATE, books: [] };
  }
}

export async function writeState(
  statePath: string,
  state: FactoryState,
): Promise<void> {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
}

/**
 * Append the given book records and stamp `last_batch_at`, then persist.
 * Returns the updated state.
 */
export async function appendBooks(
  statePath: string,
  records: BookRecord[],
  batchAt: string,
): Promise<FactoryState> {
  const state = await readState(statePath);
  state.books.push(...records);
  state.last_batch_at = batchAt;
  await writeState(statePath, state);
  return state;
}
