#!/usr/bin/env node
// Test lookupAgency against real federal links. Node built-ins only.
// Usage: node scripts/test-lookup.mjs [data/domains.json] [--md]
// Exit code 1 if any agency-level check fails.
//
// Expectations are the real-world operator of each site (agency, plus the bureau
// a reporter would want routed to), NOT what the index happens to contain.
// `bureau: null` = no bureau expected (independent agency or department-level site).

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lookupAgency } from './lookup.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const md = args.includes('--md');
const indexPath = resolve(args.find((a) => !a.startsWith('--')) ?? resolve(here, '../data/domains.json'));
const index = JSON.parse(readFileSync(indexPath, 'utf8'));

const M = (agency, bureau, why) => ({ status: 'match', agency, bureau, why });
const NO = (why) => ({ status: 'no-match', why });
const NAL = (why) => ({ status: 'not-a-link', why });

const DHS = 'Department of Homeland Security';
const HHS = 'Department of Health and Human Services';
const cases = [
  ['https://www.ssa.gov/apply/retirement', M('Social Security Administration', null, 'SSA is an independent agency; no bureau layer')],
  ['https://secure.ssa.gov/', M('Social Security Administration', null, 'subdomain of ssa.gov; should inherit parent')],
  ['https://www.va.gov/health-care/apply/', M('Department of Veterans Affairs', 'Veterans Health Administration', 'health-care pages are VHA programs; domain is department-wide')],
  ['https://www.irs.gov/forms-instructions', M('Department of the Treasury', 'Internal Revenue Service', 'IRS is a Treasury bureau')],
  ['https://www.medicare.gov/', M(HHS, 'Centers for Medicare and Medicaid Services', 'Medicare is run by CMS')],
  ['https://www.healthcare.gov/', M(HHS, 'Centers for Medicare and Medicaid Services', 'Marketplace is run by CMS/CCIIO')],
  ['https://travel.state.gov/content/travel/en/passports.html', M('Department of State', 'Bureau of Consular Affairs', 'passports are Consular Affairs')],
  ['https://my.uscis.gov/', M(DHS, 'Citizenship and Immigration Services', 'USCIS is a DHS component')],
  ['https://studentaid.gov/', M('Department of Education', 'Federal Student Aid', 'FSA operates studentaid.gov')],
  ['https://www.usajobs.gov/', M('Office of Personnel Management', null, 'OPM runs USAJOBS')],
  ['https://login.gov/', M('General Services Administration', 'Federal Acquisition Service', 'Login.gov is GSA TTS, which sits inside FAS')],
  ['https://www.usps.com/', M('United States Postal Service', null, 'USPS is federal (independent establishment); .com domain')],
  ['https://www.consumerfinance.gov/', M('Consumer Financial Protection Bureau', null, 'CFPB is independent')],
  ['https://www.fema.gov/', M(DHS, 'Federal Emergency Management Agency', 'FEMA is a DHS component')],
  // Chosen extras (bureau-level)
  ['https://www.cdc.gov/', M(HHS, 'Centers for Disease Control and Prevention', 'CDC is an HHS operating division')],
  ['https://www.nps.gov/', M('Department of the Interior', 'National Park Service', 'NPS is an Interior bureau')],
  ['https://www.fs.usda.gov/', M('Department of Agriculture', 'Forest Service', 'Forest Service site lives on a USDA subdomain')],
  ['https://www.census.gov/', M('Department of Commerce', 'Bureau of the Census', 'Census is a Commerce bureau')],
  ['https://www.tsa.gov/', M(DHS, 'Transportation Security Administration', 'TSA is a DHS component')],
  // Negative / edge cases
  ['https://www.dmv.ca.gov/', NO('California state site, not federal')],
  ['https://www.army.mil/', M('Department of Defense', 'Army', 'brief listed .mil as a negative case, but army.mil is federal (DoD/Army) and the index now includes .mil')],
  ['https://www.google.com', NO('private company')],
  ['not a url', NAL('plain text with spaces')],
  // Input-handling robustness
  ['ssa.gov', M('Social Security Administration', null, 'no scheme')],
  ['  HTTPS://WWW.IRS.GOV/  ', M('Department of the Treasury', 'Internal Revenue Service', 'whitespace + uppercase + www')],
  ['ssa.gov:443/x', M('Social Security Administration', null, 'host:port without scheme')],
  ['mailto:help@ssa.gov', NAL('mailto is not a web link')],
  ['javascript:alert(1)', NAL('non-http scheme')],
  ['http://192.168.0.1/', NAL('IP address, not a domain')],
];

let agencyPass = 0;
let bureauPass = 0;
const rows = [];
for (const [input, exp] of cases) {
  const got = lookupAgency(input, index);
  const agencyOk = got.status === exp.status && (exp.status !== 'match' || got.agency === exp.agency);
  const bureauOk = agencyOk && (exp.status !== 'match' || (got.bureau ?? null) === (exp.bureau ?? null));
  agencyPass += agencyOk;
  bureauPass += bureauOk;
  const expStr = exp.status === 'match' ? `${exp.agency}${exp.bureau ? ' / ' + exp.bureau : ''}` : exp.status;
  const gotStr = got.status === 'match' ? `${got.agency}${got.bureau ? ' / ' + got.bureau : ''} (via ${got.matchedOn})` : got.status;
  rows.push({ input, expStr, why: exp.why, gotStr, agencyOk, bureauOk });
}

if (md) {
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  console.log('| # | Input | Expected (why) | Actual | Agency | Bureau |');
  console.log('|---|---|---|---|---|---|');
  rows.forEach((r, i) =>
    console.log(`| ${i + 1} | \`${esc(r.input.trim() === r.input ? r.input : JSON.stringify(r.input))}\` | ${esc(r.expStr)} — ${esc(r.why)} | ${esc(r.gotStr)} | ${r.agencyOk ? 'PASS' : '**FAIL**'} | ${r.bureauOk ? 'PASS' : '**FAIL**'} |`),
  );
} else {
  for (const r of rows) console.log(`${r.agencyOk ? 'PASS' : 'FAIL'} ${r.bureauOk ? 'PASS' : 'FAIL'}  ${JSON.stringify(r.input)} -> ${r.gotStr}   [expected ${r.expStr}]`);
}
console.error(`agency-level: ${agencyPass}/${cases.length} pass; bureau-level: ${bureauPass}/${cases.length} pass`);
process.exitCode = agencyPass === cases.length ? 0 : 1;
