/**
 * Render portfolio-thumbnail.html to assets/portfolio-thumbnail.png
 * at exactly 1200x630 (OG/social card size).
 *
 * Requires Playwright with a Chromium browser — resolved automatically from
 * $PLAYWRIGHT_DIR, the sibling scrape-heal checkout, or a local install.
 *
 * Run: node scripts/gen-portfolio-thumbnail.mjs
 */
import { resolve } from 'node:path';
import { repoRoot, renderPng } from './lib/playwright.mjs';

const htmlPath = resolve(repoRoot, 'portfolio-thumbnail.html');
const outPath = resolve(repoRoot, 'assets', 'portfolio-thumbnail.png');

await renderPng(htmlPath, outPath, 1200, 630);
