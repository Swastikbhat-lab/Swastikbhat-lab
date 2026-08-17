/**
 * Shared Playwright resolution + launch helpers for the thumbnail generators.
 * Playwright lives in the sibling scrape-heal checkout in this workspace; the
 * scripts here must work without their own node_modules.
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(__dirname, '..', '..');

/** Find a usable playwright module. */
export function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_DIR,
    resolve(repoRoot, '../scrape-heal/node_modules/playwright'),
  ].filter(Boolean);
  for (const dir of candidates) {
    try {
      const req = createRequire(join(dir, 'noop.js'));
      const mod = req(dir); // resolves the package's main entry
      if (mod?.chromium) return mod;
    } catch { /* try next */ }
  }
  try {
    const mod = createRequire(import.meta.url)('playwright');
    if (mod?.chromium) return mod;
  } catch { /* fall through */ }
  throw new Error(
    'playwright not found — set PLAYWRIGHT_DIR to a folder containing playwright, ' +
    'e.g. PLAYWRIGHT_DIR=../scrape-heal/node_modules'
  );
}

/** Locate a chromium binary in the playwright cache if launch() fails. */
export function findCachedChromium() {
  const roots = [
    join(os.homedir(), 'AppData', 'Local', 'ms-playwright'),
    join(os.homedir(), '.cache', 'ms-playwright'),
  ];
  const wanted = ['chrome.exe', 'headless_shell.exe', 'chrome', 'headless_shell'];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries;
      try { entries = readdirSync(dir); } catch { continue; }
      for (const name of entries) {
        const full = join(dir, name);
        let isDir = false;
        try { isDir = statSync(full).isDirectory(); } catch { continue; }
        if (isDir) { stack.push(full); continue; }
        if (wanted.some((w) => name === w)) return full;
      }
    }
  }
  return undefined;
}

/** Launch chromium, falling back to a browser found in the playwright cache. */
export async function launchChromium() {
  const pw = loadPlaywright();
  try {
    return { pw, browser: await pw.chromium.launch() };
  } catch {
    const executablePath = findCachedChromium();
    if (!executablePath) {
      throw new Error('could not launch chromium or find it in the playwright cache');
    }
    return { pw, browser: await pw.chromium.launch({ executablePath }) };
  }
}

/** Render an HTML file to a PNG at the given size (waits for webfonts). */
export async function renderPng(htmlPath, outPath, width, height) {
  const { browser } = await launchChromium();
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto('file://' + htmlPath.replaceAll('\\', '/'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: outPath });
    console.log(`wrote ${outPath} (${width}x${height})`);
  } finally {
    await browser.close();
  }
}
