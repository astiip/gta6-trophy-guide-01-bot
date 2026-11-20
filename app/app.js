// Platinum Hunt — Leonida: an offline tracker + guide for the 55 GTA VI trophies.
// Progress, counters and the spoiler setting live in localStorage; export/import
// moves them as JSON. The trophy data comes from data/trophies.json, loaded the
// same way the kit starter loads it: one local fetch, no network request.
const KEY_EARNED = 'platinum-hunt-earned';
const KEY_COUNTS = 'platinum-hunt-counts';
const KEY_SPOILERS = 'platinum-hunt-spoilers';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources || [];
const byId = new Map(trophies.map((t) => [t.id, t]));

const STAGES = [
  ['S1', 'Chapter 1'],
  ['S2', 'Chapter 2'],
  ['S3', 'Chapter 3'],
  ['S4', 'Chapter 4 + finale'],
  ['S5', 'Story cleanup'],
  ['S6', 'Activities & collectibles'],
  ['S7', '100% + Platinum'],
];
const stageName = new Map(STAGES);
const KIND_LABELS = {
  story: 'Story', activity: 'Activities', crime: 'Crime',
  collectible: 'Collectibles', money: 'Money', misc: 'Misc',
};
const FILTERS = [
  ['all', 'All 55'], ['story', 'Story'], ['activity', 'Activities'],
  ['crime', 'Crime'], ['collectible', 'Collectibles'], ['money', 'Money'],
  ['misc', 'Misc'], ['missable', 'Missable'], ['watch', 'Watch'],
  ['unconfirmed', 'Unconfirmed'], ['earned', 'Earned'], ['unearned', 'Unearned'],
];

const params = new URLSearchParams(location.search);
let earned = new Set(JSON.parse(localStorage.getItem(KEY_EARNED) ?? '[]'));
let counts = JSON.parse(localStorage.getItem(KEY_COUNTS) ?? '{}');
let spoilersShown = localStorage.getItem(KEY_SPOILERS) === 'shown';
let selectedId = Number(params.get('select')) || 1;
if (!byId.has(selectedId)) selectedId = 1;
let stageFilter = params.get('stage') || null;
if (stageFilter && !stageName.has(stageFilter)) stageFilter = null;
let filter = params.get('filter') || 'all';
if (!FILTERS.some(([v]) => v === filter)) filter = 'all';
if (params.get('spoilers') === 'shown') spoilersShown = true;
if (params.get('spoilers') === 'hidden') spoilersShown = false;
// ?seed=2,3,4 pre-checks trophies in memory only, for screenshots; never saved.
const seeded = params.get('seed');
if (seeded) for (const n of seeded.split(',')) { const id = Number(n); if (byId.has(id)) earned.add(id); }

function save() {
  if (seeded) return; // screenshot seeding must not pollute the real save
  localStorage.setItem(KEY_EARNED, JSON.stringify([...earned]));
  localStorage.setItem(KEY_COUNTS, JSON.stringify(counts));
  localStorage.setItem(KEY_SPOILERS, spoilersShown ? 'shown' : 'hidden');
}

function isHidden(t) { return t.hidden && !spoilersShown && !earned.has(t.id); }
function visibleName(t) { return isHidden(t) ? 'Hidden trophy' : t.name; }
function visibleDesc(t) { return isHidden(t) ? 'Hidden trophy — reveal' : t.description; }

function matchesFilter(t) {
  if (stageFilter && t.stage !== stageFilter) return false;
  switch (filter) {
    case 'all': return true;
    case 'earned': return earned.has(t.id);
    case 'unearned': return !earned.has(t.id);
    case 'missable': return t.missable;
    case 'watch': return t.watch;
    case 'unconfirmed': return t.unconfirmed;
    default: return t.kind === filter;
  }
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function gradePill(t) { return el('span', 'pill ' + t.grade, t.grade); }

function flagChips(t) {
  const box = el('span', 'row-flags');
  if (t.missable) box.append(el('span', 'flag missable', 'MISSABLE'));
  if (t.watch) box.append(el('span', 'flag watch', 'WATCH'));
  if (t.unconfirmed) box.append(el('span', 'flag unconfirmed', 'UNCONFIRMED'));
  if (t.disagree) box.append(el('span', 'flag disagree', 'SOURCES DISAGREE'));
  if (t.singleSource) box.append(el('span', 'flag single', '1 SOURCE'));
  return box;
}

// ---- audit strip: every number computed from the data, never hardcoded ----
function renderAudit() {
  const gradeCount = (g) => trophies.filter((t) => t.grade === g).length;
  const totalSteps = trophies.reduce((n, t) => n + (t.steps || []).length, 0);
  const citedSteps = trophies.reduce(
    (n, t) => n + (t.steps || []).filter((s) => s.sources && s.sources.length).length, 0);
  const citedGuides = trophies.filter((t) =>
    (t.steps || []).some((s) => s.sources && s.sources.length)).length;
  const strip = document.getElementById('audit');
  strip.replaceChildren();
  const add = (text, bold) => strip.append(el(bold ? 'b' : 'span', null, text));
  strip.append(el('span', 'audit-label', 'AUDIT · '));
  add(`${trophies.length} official · `);
  add(`${gradeCount('platinum')}P ${gradeCount('gold')}G ${gradeCount('silver')}S ${gradeCount('bronze')}B · `, true);
  add(`${trophies.filter((t) => t.hidden).length} hidden · `);
  add(`${citedGuides}/${trophies.length} guides cite a source · `, true);
  add(`${citedSteps}/${totalSteps} steps cited · `);
  add(`${sources.length} sources read 20 Nov 2026 · `);
  add(`${trophies.filter((t) => t.missable).length} possibly missable · `, true);
  add(`${trophies.filter((t) => t.watch).length} watch · `);
  add(`${trophies.filter((t) => t.unconfirmed).length} unconfirmed · `, true);
  add(`${trophies.filter((t) => t.disagree).length} disagree`);
}

// ---- roadmap rail ----
function renderRoadmap() {
  const rail = document.getElementById('roadmap');
  rail.replaceChildren();
  for (const [code, name] of STAGES) {
    const inStage = trophies.filter((t) => t.stage === code);
    const got = inStage.filter((t) => earned.has(t.id)).length;
    const chip = el('button', 'stage-chip' + (stageFilter === code ? ' active' : ''));
    chip.type = 'button';
    chip.append(el('span', 'chip-code', code));
    chip.append(el('span', 'chip-name', name));
    chip.append(el('span', 'chip-count', `${got} / ${inStage.length} earned`));
    chip.addEventListener('click', () => {
      stageFilter = stageFilter === code ? null : code;
      renderAll();
    });
    rail.append(chip);
  }
}

// ---- filter chips ----
function renderFilters() {
  const box = document.getElementById('filters');
  box.replaceChildren();
  for (const [value, label] of FILTERS) {
    const n = value === 'all' ? trophies.length
      : trophies.filter((t) => {
          if (value === 'earned') return earned.has(t.id);
          if (value === 'unearned') return !earned.has(t.id);
          if (value === 'missable') return t.missable;
          if (value === 'watch') return t.watch;
          if (value === 'unconfirmed') return t.unconfirmed;
          return t.kind === value;
        }).length;
    const chip = el('button', 'filter-chip' + (filter === value ? ' active' : ''), `${label} · ${n}`);
    chip.type = 'button';
    chip.addEventListener('click', () => { filter = value; renderAll(); });
    box.append(chip);
  }
}

// ---- left column: checklist grouped by stage ----
function renderList() {
  const col = document.getElementById('list-col');
  col.replaceChildren();
  let shown = 0;
  for (const [code, name] of STAGES) {
    const group = trophies.filter((t) => t.stage === code && matchesFilter(t));
    if (!group.length) continue;
    shown += group.length;
    const wrap = el('section', 'stage-group');
    const h = el('h2', null, `${code} — ${name}`);
    h.append(el('span', 'stage-count',
      `${group.filter((t) => earned.has(t.id)).length} / ${group.length} earned`));
    wrap.append(h);
    for (const t of group) {
      const row = el('div', 'trophy-row' + (earned.has(t.id) ? ' earned' : '')
        + (t.id === selectedId ? ' selected' : ''));
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.id);
      box.setAttribute('aria-label', 'Earned: ' + visibleName(t));
      box.addEventListener('click', (e) => e.stopPropagation());
      box.addEventListener('change', () => {
        if (box.checked) earned.add(t.id); else earned.delete(t.id);
        save(); renderAll();
      });
      const main = el('div', 'row-main');
      const nm = el('div', 'row-name', visibleName(t));
      if (isHidden(t)) nm.append(el('span', 'hidden-tag', '  · hidden'));
      main.append(nm);
      main.append(el('div', 'row-desc', visibleDesc(t)));
      main.append(flagChips(t));
      if (t.count) {
        const cur = counts[t.id] || 0;
        main.append(el('div', 'row-count', `Your count: ${cur} / ${t.count} ${t.countLabel || ''}`));
      }
      row.append(box, main, gradePill(t));
      row.addEventListener('click', () => { selectedId = t.id; renderAll(); });
      wrap.append(row);
    }
    col.append(wrap);
  }
  if (!shown) col.append(el('p', 'empty-note', 'No trophies match this filter yet.'));
}

// ---- right column: detail panel ----
function renderDetail() {
  const panel = document.getElementById('detail');
  panel.replaceChildren();
  const t = byId.get(selectedId);
  if (isHidden(t)) {
    panel.append(el('h2', null, 'Hidden trophy'));
    const box = el('div', 'hidden-reveal',
      'This is a story trophy. Its name and guide stay hidden until you earn it — or until you turn spoilers on.');
    const btn = el('button', null, 'Reveal spoilers');
    btn.type = 'button';
    btn.addEventListener('click', () => { spoilersShown = true; save(); renderAll(); });
    box.append(btn);
    panel.append(box);
    panel.append(gradePill(t));
    return;
  }
  panel.append(el('h2', null, t.name));
  panel.append(gradePill(t));
  panel.append(el('p', 'official', '“' + t.description + '” — official description'));
  panel.append(el('p', 'short', t.short));
  if (t.missable) {
    panel.append(el('div', 'detail-banner missable',
      'POSSIBLY MISSABLE — the only trophy flagged missable. See step 2 before you finish Chapter 1.'));
  }
  if (t.unconfirmed) {
    panel.append(el('div', 'detail-banner unconfirmed',
      'NOT CONFIRMED — no source has verified a working method yet. This guide says so plainly instead of inventing steps.'));
  }
  if (t.watch) {
    panel.append(el('div', 'detail-banner watch',
      'WATCH — timing or a quest chain matters here. Start the chain as soon as it opens.'));
  }
  if (t.disagree) {
    panel.append(el('div', 'detail-banner watch',
      'SOURCES DISAGREE — the steps below show both versions and say which source says what.'));
  }
  panel.append(el('h3', null, 'IN SHORT'));
  panel.append(el('p', null, t.guide));
  panel.append(el('h3', null, 'HOW TO GET IT'));
  const ol = el('ol', 'steps');
  for (const step of t.steps || []) {
    const li = document.createElement('li');
    li.append(document.createTextNode(step.text + ' '));
    for (const n of step.sources || []) {
      const cite = el('span', 'cite');
      const a = el('a', null, `[${n}]`);
      a.href = '#src-' + n;
      cite.append(a);
      li.append(cite, document.createTextNode(' '));
    }
    ol.append(li);
  }
  panel.append(ol);
  if (t.count) {
    const box = el('div', 'counter-box');
    box.append(el('label', null, 'YOUR COUNT'));
    const row = el('div', 'counter-row');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(t.count);
    input.value = String(counts[t.id] || 0);
    input.setAttribute('aria-label', 'Your count for ' + t.name);
    input.addEventListener('change', () => {
      const v = Math.max(0, Math.min(t.count, Number(input.value) || 0));
      counts[t.id] = v;
      save(); renderAll();
    });
    row.append(input);
    row.append(el('span', 'counter-target', `/ ${t.count} ${t.countLabel || ''}`));
    box.append(row);
    const bar = el('div', 'counter-bar');
    bar.append(el('div', 'counter-fill'));
    bar.firstChild.style.width = Math.min(100, ((counts[t.id] || 0) / t.count) * 100) + '%';
    box.append(bar);
    panel.append(box);
  }
  const toggle = el('div', 'earned-toggle');
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save(); renderAll();
  });
  label.append(box, document.createTextNode(' Earned'));
  toggle.append(label);
  panel.append(toggle);
}

// ---- sources panel ----
function renderSources() {
  const list = document.getElementById('source-list');
  list.replaceChildren();
  for (const s of sources) {
    const li = document.createElement('li');
    li.id = 'src-' + s.n;
    li.append(el('span', 'src-name', `[${s.n}] ${s.name} — `));
    li.append(document.createTextNode(s.title + ' '));
    if (s.url) {
      const a = el('a', null, s.url);
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.append(document.createTextNode('(official list shipped with the kit)'));
    }
    const citedBy = trophies.filter((t) =>
      (t.steps || []).some((st) => (st.sources || []).includes(s.n))).length;
    li.append(el('div', 'src-meta',
      `read 20 Nov 2026 · cited by ${citedBy} of ${trophies.length} guides`));
    list.append(li);
  }
}

// ---- header progress + spoiler toggle ----
function renderHeader() {
  document.getElementById('progress-num').textContent = `${earned.size} / ${trophies.length} earned`;
  document.getElementById('progress-fill').style.width =
    (earned.size / trophies.length * 100) + '%';
  document.getElementById('progress-pct').textContent =
    Math.round(earned.size / trophies.length * 100) + '%';
  document.getElementById('spoiler-toggle').textContent =
    'Spoilers: ' + (spoilersShown ? 'shown' : 'hidden');
}

function renderAll() {
  renderHeader();
  renderAudit();
  renderRoadmap();
  renderFilters();
  renderList();
  renderDetail();
  renderSources();
}

document.getElementById('spoiler-toggle').addEventListener('click', () => {
  spoilersShown = !spoilersShown;
  save(); renderAll();
});
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({
    earned: [...earned], counts, spoilers: spoilersShown ? 'shown' : 'hidden',
  }, null, 2)], { type: 'application/json' }));
  a.download = 'platinum-hunt-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    earned = new Set((data.earned || []).filter((id) => byId.has(id)));
    counts = data.counts || {};
    spoilersShown = data.spoilers === 'shown';
    save(); renderAll();
  } catch { /* ignore a bad file; keep current progress */ }
});

renderAll();
