import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { buildOutputPath } from "./output-path.mjs";

test("buildOutputPath defaults to Pictures/YYYY-MM-DD when output path is omitted", () => {
  const result = buildOutputPath({
    outputPath: "",
    format: "jpeg",
    now: new Date(2026, 3, 26, 8, 9, 10, 11),
    homeDir: String.raw`C:\Users\TestUser`,
  });

  assert.equal(
    result,
    path.resolve(
      String.raw`C:\Users\TestUser`,
      "Pictures",
      "2026-04-26",
      "generated-2026-04-26T08-09-10-011.jpeg",
    ),
  );
});

test("buildOutputPath preserves explicit output paths", () => {
  const result = buildOutputPath({
    outputPath: String.raw`custom\image.png`,
    format: "png",
    now: new Date(2026, 3, 26, 8, 9, 10, 11),
    homeDir: String.raw`C:\Users\TestUser`,
  });

  assert.equal(result, path.resolve(String.raw`custom\image.png`));
});
