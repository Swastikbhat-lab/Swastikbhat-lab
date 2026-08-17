/**
 * CI guard for the profile README (README.md). Exits non-zero when:
 *   1. the README references an image asset that does not exist on disk, or
 *   2. the README uses an inline style="" attribute — GitHub's markdown
 *      sanitizer removes these, so anything relying on them renders unstyled
 *      (this is exactly what collapsed the old "What I've built" cards).
 *
 * Zero dependencies. Usage:
 *   node scripts/check-profile.mjs [path-to-markdown]   # defaults to README.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const target = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : resolve(repoRoot, 'README.md');

const src = readFileSync(target, 'utf8');
const lineOf = (index) => src.slice(0, index).split('\n').length;

let failures = 0;
function fail(line, msg) {
  failures++;
  console.log(`::error file=README.md,line=${line}::${msg}`); // GitHub annotation
  console.log(`  README.md:${line}: ${msg}`);
}

// ---- 1. every referenced image asset must exist ---------------------------
// Markdown ![alt](path) — this also catches the inner image of the linked
// [![alt](path)](url) badge form. Then HTML <img src="path">.
const refs = [];
for (const m of src.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/g)) {
  refs.push({ p: m[1], index: m.index });
}
for (const m of src.matchAll(/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi)) {
  refs.push({ p: m[1], index: m.index });
}

const isExternal = (p) => /^(https?:)?\/\//i.test(p) || /^(data|mailto):/i.test(p);
let localRefs = 0;
for (const { p, index } of refs) {
  if (isExternal(p)) continue;
  localRefs++;
  const rel = p.split('#')[0].split('?')[0];
  if (!existsSync(resolve(repoRoot, rel))) {
    fail(lineOf(index), `references a missing asset: ${p}`);
  }
}

// ---- 2. no inline style="" (GitHub strips it) -----------------------------
src.split(/\r?\n/).forEach((line, i) => {
  const m = line.match(/\bstyle\s*=\s*["'][^"']*["']/i);
  if (m) {
    fail(i + 1, `inline style GitHub strips (renders unstyled): ${m[0].slice(0, 72)}`);
  }
});

if (failures) {
  console.error(`\nprofile check FAILED — ${failures} problem(s) above.`);
  process.exit(1);
}
console.log(`profile check passed — ${localRefs} local asset reference(s) OK, no inline styles.`);
