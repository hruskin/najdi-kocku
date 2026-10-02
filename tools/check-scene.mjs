// Kontrola prostředí bez prohlížeče: node tools/check-scene.mjs [id…] [--seeds 30]
// Spustí jádro z index.html a scény ze scenes/ s atrapou Path2D a pro každou scénu ověří:
//  - build nespadne a vybere se NCATS koček,
//  - kočky nevolají RNG scény R (scéna bez koček a s kočkami musí mít stejné prvky),
//  - počet úkrytů a jejich druhy, limity v caps sedí na skutečné druhy,
//  - všechny prvky leží ve světě W×H.
// Viditelnost koček a vzhled se kontrolují v prohlížeči (viz .claude/agents/prostredi.md).
import fs from 'fs';
import vm from 'vm';

const args = process.argv.slice(2);
const si = args.indexOf('--seeds');
const nSeeds = si >= 0 ? +args[si + 1] : 30;
const ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--seeds');

const html = fs.readFileSync('index.html', 'utf8');
const a = html.indexOf('"use strict";'), b = html.indexOf('/* ---------- app ---------- */');
if (a < 0 || b < 0) throw new Error('v index.html chybí začátek jádra nebo „/* ---------- app ---------- */“');

class Path2D { moveTo() {} lineTo() {} quadraticCurveTo() {} closePath() {} }
const ctx = vm.createContext({ Path2D, console, Math });
vm.runInContext('var SCENES={};function SCENE(s){SCENES[s.id]=s}', ctx);
const files = fs.readdirSync('scenes').filter(f => f.endsWith('.js'));
for (const f of files) vm.runInContext(fs.readFileSync('scenes/' + f, 'utf8'), ctx, { filename: 'scenes/' + f });
vm.runInContext(html.slice(a + 13, b) + '\nthis.__api={buildScene,chooseCats,NCATS,W,H};', ctx, { filename: 'index.html(jádro)' });
const { buildScene, chooseCats, NCATS, W, H } = ctx.__api;

const todo = ids.length ? ids : Object.keys(ctx.SCENES);
let failed = false;
for (const id of todo) {
  const sc = ctx.SCENES[id];
  if (!sc) { console.log(`✗ ${id}: scéna neexistuje (${Object.keys(ctx.SCENES).join(', ')})`); failed = true; continue; }
  const errs = [], kinds = {}, chosen = {};
  let spots = 0, minSpots = 1e9, els = 0, ms = 0, emptyEls = 0;
  for (let s = 1; s <= nSeeds; s++) {
    const seed = (s * 2654435761) >>> 0;
    try {
      const t = performance.now();
      const dry = buildScene(id, seed, null), sel = chooseCats(dry.spots, seed, id), full = buildScene(id, seed, sel);
      ms += performance.now() - t;
      spots += dry.spots.length; minSpots = Math.min(minSpots, dry.spots.length); els += full.L.length;
      for (const p of dry.spots) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
      for (const i of sel.keys()) { const k = dry.spots[i].kind; chosen[k] = (chosen[k] || 0) + 1; }
      if (full.cats.length !== NCATS) errs.push(`seed ${s}: ${full.cats.length} koček místo ${NCATS}`);
      // prvky scény (bez koček) musí být v obou průchodech stejné, jinak kočky volají R
      const bg = full.L.filter(e => !e.r), key = e => e.b.map(v => v.toFixed(2)).join(',');
      if (bg.length !== dry.L.length || bg.some((e, i) => key(e) !== key(dry.L[i])))
        errs.push(`seed ${s}: scéna se liší podle toho, kde jsou kočky – kreslení koček (spot callback) volá R nebo rr/pick`);
      // prázdný prvek (nic nenakreslil) nevadí, jen zbytečně zabírá display list
      const empty = full.L.filter(e => e.b[0] > e.b[2]).length; if (empty) emptyEls += empty;
      const out = full.L.find(e => e.b[0] <= e.b[2] && (e.b[2] < -80 || e.b[0] > W + 80 || e.b[3] < -80 || e.b[1] > H + 80));
      if (out) errs.push(`seed ${s}: prvek celý mimo svět (bbox ${out.b.map(Math.round)})`);
      if (full.cats.some(c => !(c.r > 0) || !isFinite(c.x) || !isFinite(c.y))) errs.push(`seed ${s}: kočka s neplatným hitboxem`);
      const edge = full.cats.find(c => c.x < 25 || c.x > W - 25 || c.y < 25 || c.y > H - 25);
      if (edge) errs.push(`seed ${s}: kočka u okraje nebo mimo papír (${Math.round(edge.x)}, ${Math.round(edge.y)}) – nejde najít`);
    } catch (e) { errs.push(`seed ${s}: výjimka ${e.message}\n    ${(e.stack || '').split('\n').slice(1, 3).join('\n    ')}`); }
  }
  const capKinds = Object.keys(sc.caps || {}), spotKinds = Object.keys(kinds);
  const warn = [];
  const noCap = spotKinds.filter(k => !capKinds.includes(k)); if (noCap.length) warn.push(`druhy bez limitu v caps (=1): ${noCap.join(', ')}`);
  const deadCap = capKinds.filter(k => !spotKinds.includes(k)); if (deadCap.length) warn.push(`caps bez odpovídajících úkrytů: ${deadCap.join(', ')}`);
  if (!sc.name || !sc.where) warn.push('chybí name nebo where');
  if (emptyEls) warn.push(`prázdné prvky (add bez kreslení): ${emptyEls} za ${nSeeds} seedů`);
  const avg = spots / nSeeds;
  if (avg < 80) warn.push(`málo úkrytů: průměr ${avg.toFixed(0)} (cíl ≥ 90 jako Muzeum)`);
  if (Object.keys(chosen).length < 12) warn.push(`kočky jen v ${Object.keys(chosen).length} druzích úkrytů (cíl ≥ 15)`);
  console.log(`${errs.length ? '✗' : '✓'} ${id} (${sc.name}): ${nSeeds} seedů, úkrytů průměrně ${avg.toFixed(0)} (min ${minSpots}), ` +
    `prvků ${(els / nSeeds).toFixed(0)}, sestavení ${(ms / nSeeds).toFixed(1)} ms, druhů úkrytů ${spotKinds.length}, s kočkou ${Object.keys(chosen).length}`);
  console.log('  vybrané druhy: ' + Object.entries(chosen).sort((p, q) => q[1] - p[1]).map(([k, v]) => `${k} ${v}`).join(', '));
  for (const w of warn) console.log('  ! ' + w);
  for (const e of errs.slice(0, 8)) console.log('  ✗ ' + e);
  if (errs.length) failed = true;
}
process.exit(failed ? 1 : 0);
