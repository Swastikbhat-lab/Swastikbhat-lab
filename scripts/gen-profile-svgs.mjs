/**
 * Generate assets/header.svg, assets/footer.svg, and preview.html (with the
 * SVGs inlined so the Freebuff preview works without a server).
 *
 * Monochrome, SMIL typewriter animation, no scripts — GitHub-safe.
 * Run: node scripts/gen-profile-svgs.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assets = resolve(__dirname, '..', 'assets');

// Monochrome palette — the whole profile is BnW now.
const P = {
  bg: '#010409',
  win: '#0d1117',
  winBorder: '#30363d',
  titleBar: '#161b22',
  dim: '#8b949e',
  text: '#e6edf3',
  dot: '#3d444d',
};

const FONT = 18;
const CHAR_W = 10.5;
const STEP = 30;
const X0 = 70;
const TITLE_BAR_H = 46;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Render a terminal session SVG. Geometry is computed so the window always
 * contains the lines, the cursor, and the bottom bar.
 */
function session({ title, lines, winY = 36 }) {
  const width = 1200;
  const n = lines.length;
  const textY0 = winY + TITLE_BAR_H + 40; // first baseline
  const winH = TITLE_BAR_H + 40 + n * STEP + 24; // room for cursor below last line
  const barY = winY + winH - 4;
  const height = winY + winH + 20;
  const cursorY = textY0 + n * STEP - 6;

  const clips = [];
  const rows = [];
  let t = 0.6;
  lines.forEach((ln, i) => {
    const y = textY0 + i * STEP;
    const w = Math.min(ln.s.length * CHAR_W + 40, 1100);
    clips.push(
      `<clipPath id="l${i}"><rect x="${X0}" y="${y - FONT}" width="0" height="${FONT + 6}"><animate attributeName="width" from="0" to="${w.toFixed(0)}" begin="${t.toFixed(1)}s" dur="0.8s" fill="freeze"/></rect></clipPath>`,
    );
    const color = ln.t === 'cmd' ? P.dim : P.text;
    rows.push(
      `  <g clip-path="url(#l${i})"><text x="${X0}" y="${y}" font-size="${FONT}" fill="${color}">${esc(ln.s)}</text></g>`,
    );
    t += 1.25;
  });
  const cursorBegin = t + 0.4;

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace">
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e6edf3"/>
      <stop offset="0.5" stop-color="#8b949e"/>
      <stop offset="1" stop-color="#e6edf3"/>
      <animate attributeName="x1" values="0;1;0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>
${clips.map((c) => '    ' + c).join('\n')}
  </defs>

  <rect width="${width}" height="${height}" fill="${P.bg}"/>

  <rect x="40" y="${winY}" width="${width - 80}" height="${winH}" rx="14" fill="${P.win}" stroke="${P.winBorder}" stroke-width="2"/>
  <rect x="40" y="${winY}" width="${width - 80}" height="${TITLE_BAR_H}" rx="14" fill="${P.titleBar}"/>
  <rect x="40" y="${winY + TITLE_BAR_H - 18}" width="${width - 80}" height="18" fill="${P.titleBar}"/>
  <circle cx="78" cy="${winY + 23}" r="6.5" fill="${P.dot}"/>
  <circle cx="99" cy="${winY + 23}" r="6.5" fill="${P.dot}"/>
  <circle cx="120" cy="${winY + 23}" r="6.5" fill="${P.dot}"/>
  <text x="${width / 2}" y="${winY + 29}" text-anchor="middle" font-size="15" fill="${P.dim}">${esc(title)}</text>

${rows.join('\n')}

  <rect x="${X0}" y="${cursorY}" width="10" height="20" fill="${P.text}">
    <animate attributeName="opacity" values="1;0;1" dur="1s" begin="${cursorBegin.toFixed(1)}s" repeatCount="indefinite"/>
  </rect>

  <rect x="40" y="${barY}" width="${width - 80}" height="4" rx="2" fill="url(#bar)"/>
</svg>
`,
    height,
  };
}

// ---- header: the full about session ---------------------------------------
const header = session({
  title: 'swastik@github — ~/profile',
  lines: [
    { t: 'cmd', s: '$ whoami' },
    { t: 'out', s: 'swastik — ai/ml engineer building things that decide things' },
    { t: 'cmd', s: '$ pwd' },
    { t: 'out', s: '~/ms-cs · gwu · arlington, va' },
    { t: 'cmd', s: '$ cat now' },
    { t: 'out', s: 'shipping  → multi-agent code review (CodeGuardian) · self-healing scrapers (scrape-heal)' },
    { t: 'out', s: 'learning  → scaling multi-agent systems past the prototype · RL fundamentals' },
    { t: 'out', s: 'open to   → applied AI/ML where the output changes a business decision' },
    { t: 'cmd', s: '$ cat proof' },
    { t: 'out', s: '✗ no fine-tuning, no labeled data — beat GPT-4-level baselines on TruthfulQA' },
    { t: 'out', s: '  with an unsupervised label elicitation algorithm straight from a 2025 paper' },
    { t: 'out', s: '✓ 8-agent code review system — human review time −60%, coverage up to 87%' },
    { t: 'out', s: '✓ wind-farm digital twin — faults caught before downtime · 0.91 AUC' },
    { t: 'cmd', s: '$ cat ask_me' },
    { t: 'out', s: 'langgraph pipelines · EEG signal classification · turbine fault detection · energy project risk models' },
  ],
});
writeFileSync(resolve(assets, 'header.svg'), header.svg);

// ---- footer: $ cat contact -------------------------------------------------
const footer = session({
  title: 'swastik@github — ~/contact',
  winY: 30,
  lines: [
    { t: 'cmd', s: '$ cat contact' },
    { t: 'out', s: 'email → s.bhat@gwu.edu' },
    { t: 'out', s: 'site  → https://wise-white-iebpvfefdq.edgeone.app/' },
    { t: 'out', s: 'motto → an output that changes a business decision beats a benchmark that impresses nobody' },
  ],
});
writeFileSync(resolve(assets, 'footer.svg'), footer.svg);

// ---- preview.html with the SVGs inlined (no server needed) -----------------
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Swastikbhat-lab profile — preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0d1117; min-height: 100vh; display: flex; flex-direction: column;
         align-items: center; justify-content: center; gap: 26px; padding: 32px;
         font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; }
  .card { width: min(940px, 96vw); background: #010409; border: 1px solid #30363d;
          border-radius: 14px; overflow: hidden; box-shadow: 0 18px 80px rgba(0,0,0,.7); }
  .card h2 { padding: 14px 20px 0; color: #8b949e; font-size: 13px; letter-spacing: 1px;
             text-transform: uppercase; }
  .card .note { padding: 0 20px 14px; color: #484f58; font-size: 12px; }
  .card svg { display: block; width: 100%; height: auto; }
  .badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 6px 24px 24px; }
  .badge { background: #1f2328; border: 1px solid #30363d; color: #e6edf3; font-size: 12px;
           padding: 6px 12px; border-radius: 999px; }
</style>
</head>
<body>

<div class="card">
  <h2>Header — assets/header.svg (full about session, monochrome, typed)</h2>
  <div class="note">whoami → pwd → now → proof → ask_me, all in one terminal. SMIL, plays on GitHub.</div>
  ${header.svg}
</div>

<div class="card">
  <h2>Footer — assets/footer.svg ($ cat contact)</h2>
  <div class="note">email · site · motto — same terminal, same BnW palette.</div>
  ${footer.svg}
</div>

<div class="card">
  <h2>Stats row — renders on GitHub (external services)</h2>
  <div class="note">trophies (grayscale) + streak (recolored BnW) + top-languages; all badges monochrome.</div>
  <div class="badges">
    <span class="badge">trophies — darkhub</span>
    <span class="badge">streak — gray ring/fire</span>
    <span class="badge">top languages</span>
    <span class="badge">no emoji — plain BnW headers</span>
  </div>
</div>

</body>
</html>
`;
writeFileSync(resolve(__dirname, '..', 'preview.html'), page);

console.log(`wrote header.svg (${header.height}px), footer.svg (${footer.height}px), preview.html`);
