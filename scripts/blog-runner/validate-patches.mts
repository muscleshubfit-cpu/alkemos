import { validateMsaConversion, scanArabicDialect } from "../../src/lib/blog-msa";
import { readFileSync } from "node:fs";

const pairs: Array<[string, string]> = [
  ["calculate-daily-calories-weight-loss", "/tmp/orig_calculate-daily-calories-weight-loss.md"],
  ["best-protein-supplement-ramadan", "/tmp/orig_best-protein-supplement-ramadan.md"],
];

for (const [slug, origPath] of pairs) {
  const before = readFileSync(origPath, "utf-8");
  const after = readFileSync(
    `/home/z/my-project/alkemos/scripts/legacy-msa-patches/${slug}.md`,
    "utf-8",
  );
  const check = validateMsaConversion(before, after);
  const sb = scanArabicDialect(before);
  const sa = scanArabicDialect(after);
  console.log(`\n=== ${slug}`);
  console.log(
    `ok=${check.ok} — S ${sb.strong}→${sa.strong} · W ${sb.weak}→${sa.weak} · words ${check.metrics.wordsBefore}→${check.metrics.wordsAfter} (ratio ${check.metrics.ratio.toFixed(2)})`,
  );
  if (!check.ok) {
    console.log("VIOLATIONS:");
    for (const v of check.violations) console.log("  - " + v);
    process.exitCode = 1;
  }
}
