import { test } from "node:test";
import assert from "node:assert/strict";
import { EDITIONS, editionsFor } from "./editions.js";

// Distinct titles are the whole point of the catalog — a collision would put two
// identical-titled books on KDP (duplicate-content flag risk). Lock it.
test("every edition has a unique title noun", () => {
  const titles = EDITIONS.map((e) => e.titleNoun);
  assert.equal(new Set(titles).size, titles.length, "edition titleNouns must be unique");
});

test("every edition key is unique", () => {
  const keys = EDITIONS.map((e) => e.key);
  assert.equal(new Set(keys).size, keys.length);
});

test("word-search editions carry a theme", () => {
  for (const e of editionsFor("word-search")) {
    assert.ok(e.theme && e.themeLabel, `${e.key} needs theme + themeLabel`);
  }
});
