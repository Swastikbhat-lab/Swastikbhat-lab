/**
 * Generate assets/header-v6.svg, assets/footer-v3.svg, assets/achievements-v2.svg,
 * assets/stats-v3.svg, the light badge pills (assets/badge-*.svg), and preview.html
 * (with the SVGs inlined so the Freebuff preview works without a server).
 *
 * Light monochrome, SMIL typewriter animation, no scripts — GitHub-safe.
 * Run: node scripts/gen-profile-svgs.mjs
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assets = resolve(__dirname, '..', 'assets');

// Light monochrome palette — GitHub light-mode tokens, so the SVGs sit
// seamlessly on the white README page instead of floating as black boxes.
const P = {
  bg: '#ffffff',
  win: '#f6f8fa',
  winBorder: '#d0d7de',
  titleBar: '#eef1f4',
  dim: '#57606a',
  text: '#1f2328',
  dot: '#afb8c1',
};

const FONT = 18;
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
  const height = winY + winH + 12;
  const cursorY = textY0 + n * STEP - 6;

  // All lines are visible from the first frame — a slow typewriter reveal made
  // the header look half-empty (and 'broken') to anyone visiting mid-animation.
  // Only the cursor animates, so the terminal stays calm and seamless.
  const rows = lines.map((ln, i) => {
    const y = textY0 + i * STEP;
    const color = ln.t === 'cmd' ? P.dim : P.text;
    return `  <text x="${X0}" y="${y}" font-size="${FONT}" fill="${color}">${esc(ln.s)}</text>`;
  });

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace">
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
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>
`,
    height,
  };
}

// ---- header: the full about session ---------------------------------------
// Cache-busted name: camo (GitHub's image proxy) served stale bytes of the old
// animated header forever because the URL never changed. A rename forces a
// fresh fetch — v4 → v5 for the light theme, v5 → v6 once the bottom bar was
// dropped so the images sit seamlessly on the page.
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
writeFileSync(resolve(assets, 'header-v6.svg'), header.svg);

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
writeFileSync(resolve(assets, 'footer-v3.svg'), footer.svg);

// ---- achievements strip (replaces the dead github-profile-trophy service) ---
// Self-hosted, monochrome, real numbers — cannot break like the third-party
// trophy API (which now returns HTTP 402).
function achievements() {
  const items = [
    '13 public repos',
    'MS CS @ GWU',
    'TruthfulQA ≥ GPT-4',
    'AUC 0.91',
    'review time −60%',
    'MIT open source',
  ];
  const chipH = 60;
  const chipY = 28;
  const gap = 14;
  const font = 16;
  const totalW = 1200;
  const inner = totalW - 80; // 40 margin each side
  const chipW = Math.floor((inner - gap * (items.length - 1)) / items.length);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${chipY + chipH + 24}" viewBox="0 0 ${totalW} ${chipY + chipH + 24}" font-family="ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace">
  <rect width="${totalW}" height="${chipY + chipH + 24}" fill="${P.bg}"/>
${items.map((it, i) => {
    const x = 40 + i * (chipW + gap);
    const cx = x + chipW / 2;
    const t1 = it.indexOf(' ');
    const head = t1 === -1 ? it : it.slice(0, t1);
    const rest = t1 === -1 ? '' : it.slice(t1);
    return `  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" begin="${(0.4 + i * 0.35).toFixed(1)}s" dur="0.5s" fill="freeze"/>
    <rect x="${x}" y="${chipY}" width="${chipW}" height="${chipH}" rx="12" fill="${P.win}" stroke="${P.winBorder}" stroke-width="1.5"/>
    <text x="${cx}" y="${chipY + 38}" text-anchor="middle" font-size="${font}" font-weight="bold" fill="${P.text}">${esc(head)}</text>
    <text x="${cx}" y="${chipY + 18}" text-anchor="middle" font-size="${font - 4}" fill="${P.dim}">${esc(rest)}</text>
  </g>`;
  }).join('\n')}
</svg>
`;
  return svg;
}

// ---- projects panel (replaces the HTML cards GitHub strips of their styling) --
// "What I've built" used inline-CSS <td> cards; GitHub's markdown sanitizer
// removes every style attribute, so on the live profile they collapsed into a
// plain, borderless table. Same fix as the rest of this profile: render it as a
// self-hosted terminal SVG that GitHub cannot restyle or break.
function projects() {
  const width = 1200;
  const winY = 30;
  const items = [
    { name: 'scrape-heal',  stack: 'TypeScript · Playwright · npm', desc: 'a scraper that repairs its own selectors when the site redesigns — verify-then-ship' },
    { name: 'CodeGuardian', stack: 'LangGraph · Claude · RAG',      desc: '8-agent code review — human review time −60%, coverage up to 87%' },
    { name: 'TurboForge',   stack: 'Temporal GANs · PyTorch',       desc: 'wind-farm digital twin — faults caught before downtime, 0.91 AUC' },
    { name: 'GridIQ',       stack: 'XGBoost · SHAP · GeoPandas',    desc: 'flags renewable energy projects at capital-withdrawal risk' },
  ];

  const rows = [];
  let y = winY + TITLE_BAR_H + 42; // baseline of the "$ ls projects/" line
  rows.push(`  <text x="${X0}" y="${y}" font-size="${FONT}" fill="${P.dim}">$ ls projects/</text>`);

  const CH = 10.8; // monospace advance width at 18px, to place the stack after the name
  for (const it of items) {
    y += 44; // gap before each project name
    const stackX = Math.round(X0 + it.name.length * CH + 22);
    rows.push(`  <text x="${X0}" y="${y}" font-size="${FONT}" font-weight="bold" fill="${P.text}">${esc(it.name)}</text>`);
    rows.push(`  <text x="${stackX}" y="${y}" font-size="${FONT - 4}" fill="${P.dim}">${esc(it.stack)}</text>`);
    y += 26; // description baseline
    rows.push(`  <text x="${X0}" y="${y}" font-size="${FONT - 3}" fill="${P.dim}">${esc(it.desc)}</text>`);
  }

  const cursorY = y + 24;
  const winH = cursorY + 22 - winY;
  const height = winY + winH + 12;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace">
  <rect width="${width}" height="${height}" fill="${P.bg}"/>

  <rect x="40" y="${winY}" width="${width - 80}" height="${winH}" rx="14" fill="${P.win}" stroke="${P.winBorder}" stroke-width="2"/>
  <rect x="40" y="${winY}" width="${width - 80}" height="${TITLE_BAR_H}" rx="14" fill="${P.titleBar}"/>
  <rect x="40" y="${winY + TITLE_BAR_H - 18}" width="${width - 80}" height="18" fill="${P.titleBar}"/>
  <circle cx="78" cy="${winY + 23}" r="6.5" fill="${P.dot}"/>
  <circle cx="99" cy="${winY + 23}" r="6.5" fill="${P.dot}"/>
  <circle cx="120" cy="${winY + 23}" r="6.5" fill="${P.dot}"/>
  <text x="${width / 2}" y="${winY + 29}" text-anchor="middle" font-size="15" fill="${P.dim}">swastik@github — ~/projects</text>

${rows.join('\n')}

  <rect x="${X0}" y="${cursorY}" width="10" height="20" fill="${P.text}">
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>
`;
}

const achievementsSvg = achievements();
writeFileSync(resolve(assets, 'achievements-v2.svg'), achievementsSvg);

const projectsSvg = projects();
writeFileSync(resolve(assets, 'projects-v1.svg'), projectsSvg);

// ---- curated stats readout (replaces the raw GitHub cards) ------------------
// The github-readme-stats cards exposed raw numbers that read badly for a
// fresh account (Rank C, 0 stars). This is a curated, honest snapshot of the
// numbers that do read well — self-hosted, so it cannot break or embarrass.
const stats = session({
  title: 'swastik@github — ~/stats',
  winY: 30,
  lines: [
    { t: 'cmd', s: '$ gh stats --profile' },
    { t: 'out', s: 'years_on_github    7' },
    { t: 'out', s: 'public_repos       13' },
    { t: 'out', s: 'commits_this_year  159' },
    { t: 'out', s: 'languages          Python · Jupyter · TypeScript · JavaScript' },
  ],
});
writeFileSync(resolve(assets, 'stats-v3.svg'), stats.svg);

// ---- badge pills (replace shields.io: it cannot do dark text on light) ------
// Hand-rolled pills that match the light terminal — white, thin border, black
// text, crisp 16px glyphs. Same BnW language as the rest of the profile.
const GLYPHS = {
  mail: `<path d="M1.5 4.25h13v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7.5z" fill="none" stroke="#1f2328" stroke-width="1.5" stroke-linejoin="round"/><path d="M1.75 4.75 8 9.5l6.25-4.75" fill="none" stroke="#1f2328" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  arrow: `<path d="M5.25 10.75 10.75 5.25 M5.5 5.25h5.25v5.25" fill="none" stroke="#1f2328" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  github: `<path fill="#1f2328" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>`,
};

function badgeSvg({ label, glyph, slug }) {
  const fontSize = 13;
  const charW = 8;
  const textW = label.length * charW;
  const hasIcon = Boolean(glyph);
  const pad = 18; // symmetric padding on both sides
  const h = 36;
  // Layout is computed so the whole block (glyph + gap + text) is centered in
  // the pill, not just the text: text-only pills get text centered directly.
  let w, textX, glyphX;
  if (hasIcon) {
    const blockW = 16 + 14 + textW; // glyph + gap + text
    w = blockW + 2 * pad;
    glyphX = pad; // glyph spans pad..pad+16
    textX = pad + 16 + 14 + textW / 2; // anchor middle of the text run
  } else {
    w = textW + 2 * pad;
    textX = w / 2;
    glyphX = 0;
  }
  const glyphSvg = glyph ? `  <g transform="translate(${glyphX} 10)">${glyph}</g>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace">
  <rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="${h / 2 - 0.75}" fill="#ffffff" stroke="${P.winBorder}" stroke-width="1.5"/>
${glyphSvg}
  <text x="${textX}" y="22" text-anchor="middle" font-size="${fontSize}" fill="${P.text}">${esc(label)}</text>
</svg>
`;
  writeFileSync(resolve(assets, `badge-${slug}.svg`), svg);
  return svg;
}

const badgeEmail = badgeSvg({ label: 's.bhat@gwu.edu', glyph: GLYPHS.mail, slug: 'email' });
const badgePortfolio = badgeSvg({ label: 'portfolio', glyph: GLYPHS.arrow, slug: 'portfolio' });
const badgeGithub = badgeSvg({ label: 'Swastikbhat-lab', glyph: GLYPHS.github, slug: 'github' });

const techBadges = [
  ['Python', 'python'],
  ['Java', 'java'],
  ['TypeScript', 'typescript'],
  ['C++', 'cpp'],
  ['PyTorch', 'pytorch'],
  ['scikit-learn', 'scikit-learn'],
  ['TensorFlow', 'tensorflow'],
  ['NumPy', 'numpy'],
  ['Pandas', 'pandas'],
  ['Plotly', 'plotly'],
  ['SciPy', 'scipy'],
  ['LangGraph', 'langgraph'],
  ['PostgreSQL', 'postgresql'],
  ['MySQL', 'mysql'],
  ['mlflow', 'mlflow'],
];
const techSvg = techBadges.map(([label, slug]) => badgeSvg({ label, slug }));

// ---- preview.html with the SVGs inlined (no server needed) -----------------
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Swastikbhat-lab profile — preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f6f8fa; min-height: 100vh; display: flex; flex-direction: column;
         align-items: center; justify-content: center; gap: 26px; padding: 32px;
         font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; }
  .card { width: min(940px, 96vw); background: #ffffff; border: 1px solid #d0d7de;
          border-radius: 14px; overflow: hidden; box-shadow: 0 18px 60px rgba(31,35,40,.08); }
  .card h2 { padding: 14px 20px 0; color: #57606a; font-size: 13px; letter-spacing: 1px;
             text-transform: uppercase; }
  .card .note { padding: 0 20px 14px; color: #6e7781; font-size: 12px; }
  .card svg { display: block; width: 100%; height: auto; }
  .badges { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; align-items: center; padding: 6px 24px 24px; }
  .badges svg { width: auto; height: 36px; }
</style>
</head>
<body>

<div class="card">
  <h2>Header — assets/header-v6.svg (full session, light monochrome, always complete)</h2>
  <div class="note">whoami → pwd → now → proof → ask_me, all in one terminal. SMIL, plays on GitHub. White canvas = seamless with the light page.</div>
  ${header.svg}
</div>

<div class="card">
  <h2>Contact badges — assets/badge-email.svg · badge-portfolio.svg · badge-github.svg</h2>
  <div class="note">self-hosted pills — white, thin border, black text. Replaces the dark shields.io badges.</div>
  <div class="badges">
    ${badgeEmail}
    ${badgePortfolio}
    ${badgeGithub}
  </div>
</div>

<div class="card">
  <h2>Achievements — assets/achievements-v2.svg (self-hosted, replaces dead trophy API)</h2>
  <div class="note">real numbers, monochrome chips, fade-in — cannot break like github-profile-trophy (HTTP 402).</div>
  ${achievementsSvg}
</div>

<div class="card">
  <h2>What I've built — assets/projects-v1.svg (replaces the HTML cards GitHub strips)</h2>
  <div class="note">GitHub removes inline style attributes, so the old &lt;td&gt; cards rendered as a plain table. A self-hosted SVG survives.</div>
  ${projectsSvg}
</div>

<div class="card">
  <h2>Stats — assets/stats-v3.svg (curated readout, self-hosted)</h2>
  <div class="note">real numbers that read well — account age, repos, commits, languages. No Rank C, no 0-star widget.</div>
  ${stats.svg}
</div>

<div class="card">
  <h2>Footer — assets/footer-v3.svg ($ cat contact)</h2>
  <div class="note">email · site · motto — same terminal, same light BnW palette.</div>
  ${footer.svg}
</div>

<div class="card">
  <h2>Tech-stack pills — assets/badge-*.svg</h2>
  <div class="note">same pill style as the contact badges, one per technology.</div>
  <div class="badges">
    ${techSvg.join('\n    ')}
  </div>
</div>

</body>
</html>
`;
writeFileSync(resolve(__dirname, '..', 'preview.html'), page);

console.log('wrote header-v6.svg, footer-v3.svg, achievements-v2.svg, projects-v1.svg, stats-v3.svg, 18 badges, preview.html');
