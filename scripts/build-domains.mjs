#!/usr/bin/env node
// Build data/domains.json from GSA's Federal Website Index (CC0-1.0).
//   Source: https://github.com/GSA/federal-website-index
//   File:   data/site-scanning-target-url-list.csv
//
// Usage: node scripts/build-domains.mjs [path/to/csv] [path/to/out.json]
//   default csv: scripts/.cache/federal-website-index.csv
//   default out: data/domains.json
//
// Fetch the CSV first, e.g.:
//   curl -sSL https://raw.githubusercontent.com/GSA/federal-website-index/main/data/site-scanning-target-url-list.csv \
//     -o scripts/.cache/federal-website-index.csv
//
// Output shape (see scripts/lookup.mjs):
//   {
//     v: 1,
//     source: { url, commit?, fetched?, license },
//     pairs: [[agency, bureau], ...],   // bureau "" when the index has none
//     domains: { "<host>": pairIndex }  // base domains + subdomain overrides
//   }
// Built with Node built-ins only.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const csvPath = resolve(process.argv[2] ?? resolve(here, '.cache/federal-website-index.csv'));
const outPath = resolve(process.argv[3] ?? resolve(root, 'data/domains.json'));

/** RFC 4180 CSV parser: handles quoted fields, embedded commas, "" escapes, CRLF, newlines in quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  if (text.charCodeAt(0) === 0xfeff) i = 1; // BOM
  for (; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const normHost = (h) => h.trim().toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
const tidy = (s) => (s ?? '').trim().replace(/\s+/g, ' ');

const rows = parseCsv(readFileSync(csvPath, 'utf8'));
const header = rows.shift();
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
for (const need of ['initial_url', 'base_domain', 'agency', 'bureau']) {
  if (!(need in col)) throw new Error(`CSV missing column "${need}". Columns: ${header.join(', ')}`);
}

const stats = { rows: 0, badRows: 0, noAgency: 0, noAgencyDomains: new Set(), tld: {} };
const baseCounts = new Map(); // base -> Map(pairKey -> count)
const hostPair = new Map(); // host -> Map(pairKey -> count)

for (const r of rows) {
  if (r.length === 1 && r[0] === '') continue; // blank line
  stats.rows++;
  if (r.length !== header.length) { stats.badRows++; continue; }
  const base = normHost(r[col.base_domain]);
  const host = normHost(r[col.initial_url].replace(/^[a-z]+:\/\//i, '').split('/')[0]);
  const agency = tidy(r[col.agency]);
  const bureau = tidy(r[col.bureau]);
  const tld = base.split('.').pop();
  stats.tld[tld] = (stats.tld[tld] ?? 0) + 1;
  if (!base || !host) { stats.badRows++; continue; }
  if (!agency) { stats.noAgency++; stats.noAgencyDomains.add(base); continue; }
  const key = `${agency}\u0000${bureau}`;
  for (const [map, k] of [[baseCounts, base], [hostPair, host]]) {
    if (!map.has(k)) map.set(k, new Map());
    const m = map.get(k);
    m.set(key, (m.get(key) ?? 0) + 1);
  }
}

const mostCommon = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];

// 1. base_domain -> most common pair
const chosen = new Map();
let conflicts = 0;
for (const [base, m] of baseCounts) {
  if (m.size > 1) {
    conflicts++;
    process.stderr.write(`conflict: ${base} has ${m.size} agency/bureau pairs: ${[...m].map(([k, n]) => `${k.replace('\u0000', ' / ')} (${n})`).join('; ')}\n`);
  }
  chosen.set(base, mostCommon(m));
}

// 2. subdomain overrides: hosts whose pair differs from what the parent walk would resolve to.
//    Process shallow -> deep so nested overrides are respected.
const resolveWalk = (host) => {
  let h = host;
  while (h.includes('.')) {
    if (chosen.has(h)) return chosen.get(h);
    h = h.slice(h.indexOf('.') + 1);
  }
  return undefined;
};
let overrides = 0;
const hosts = [...hostPair.keys()].filter((h) => !baseCounts.has(h)).sort((a, b) => a.split('.').length - b.split('.').length || (a < b ? -1 : 1));
for (const host of hosts) {
  const pair = mostCommon(hostPair.get(host));
  if (resolveWalk(host) !== pair) { chosen.set(host, pair); overrides++; }
}

// 3. Compact encoding: dedupe pairs into a table, map host -> index.
const pairIndex = new Map();
const pairs = [];
const domains = {};
for (const host of [...chosen.keys()].sort()) {
  const key = chosen.get(host);
  if (!pairIndex.has(key)) { pairIndex.set(key, pairs.length); pairs.push(key.split('\u0000')); }
  domains[host] = pairIndex.get(key);
}

const out = {
  v: 1,
  source: {
    url: 'https://github.com/GSA/federal-website-index/blob/main/data/site-scanning-target-url-list.csv',
    commit: process.env.FWI_COMMIT || undefined,
    fetched: process.env.FWI_FETCHED || undefined,
    license: 'CC0-1.0',
  },
  pairs,
  domains,
};
const json = JSON.stringify(out);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, json + '\n');

const raw = Buffer.byteLength(json + '\n');
const gz = gzipSync(json + '\n', { level: 9 }).length;
process.stderr.write(
  [
    `rows: ${stats.rows} (malformed: ${stats.badRows})`,
    `rows by base TLD: ${JSON.stringify(stats.tld)}`,
    `rows with empty agency (skipped): ${stats.noAgency} across ${stats.noAgencyDomains.size} base domains: ${[...stats.noAgencyDomains].sort().join(', ')}`,
    `unique base domains (with agency): ${baseCounts.size}`,
    `base domains with conflicting pairs: ${conflicts}`,
    `subdomain overrides: ${overrides}`,
    `distinct agency/bureau pairs: ${pairs.length}`,
    `domains.json keys: ${Object.keys(domains).length}`,
    `domains.json size: ${raw} bytes raw, ${gz} bytes gzip -9`,
    `wrote ${outPath}`,
  ].join('\n') + '\n',
);
