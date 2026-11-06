# Domain-to-agency lookup test (2026-10-03)

Tests whether GSA's Federal Website Index can drive Barrier Report's "paste a link, get the responsible agency" step, using the spec rule: exact host first, then walk up to parent domains.

## Source

| | |
|---|---|
| Repo | https://github.com/GSA/federal-website-index |
| Canonical file (named in the README) | `data/site-scanning-target-url-list.csv` — https://github.com/GSA/federal-website-index/blob/main/data/site-scanning-target-url-list.csv |
| Pinned fetch URL | https://raw.githubusercontent.com/GSA/federal-website-index/80180f5f147fce4ffc0d23e16a83a873ecfc1fd7/data/site-scanning-target-url-list.csv |
| Commit | `80180f5f147fce4ffc0d23e16a83a873ecfc1fd7`, "Build target url list", 2026-10-03T21:26:03Z (the latest commit that touched the file when I checked) |
| Fetched | 2026-10-03 |
| File size / SHA-256 | 8,384,025 bytes / `4c636516269e0d2a5e05ef3754b57295dceca006f6a88c0f1e2f48a4a6fff336` |
| License | CC0-1.0. The repo's `LICENSE` file reads "Creative Commons Legal Code / CC0 1.0 Universal", and the GitHub API reports `spdx_id: CC0-1.0`. |
| Update cadence | The README says the file is rebuilt automatically every Wednesday at 6pm ET. A build commit also landed today (Saturday), so the actual cadence varies. |

### Columns (38)

`initial_url, base_domain, top_level_domain, branch, agency, bureau, source_list_federal_domains, source_list_dap, source_list_pulse, source_list_omb_idea, source_list_eotw, source_list_usagov, source_list_gov_man, source_list_uscourts, source_list_oira, source_list_other, source_list_mil_1, source_list_mil_2, source_list_dod_public, source_list_dotmil, source_list_final_url_websites, source_list_house_117th, source_list_senate_117th, source_list_gpo_fdlp, source_list_cisa, source_list_dod_2025, source_list_dap_2, source_list_usagov_clicks, source_list_usagov_clicks_mil, source_list_search_gov, source_list_search_gov_mil, source_list_public_inventory, source_list_non_gov_mil, source_list_govt_urls, source_list_hyperlink_domains, filtered, pageviews, visits`

There is no `target_url` column. The host column is **`initial_url`**, which holds bare hostnames with no scheme (e.g. `accessibility.18f.gov`). `filtered=true` (4,240 rows) marks hosts the ignore lists treat as probably non-public, such as staging and admin hosts. All rows were kept for the mapping, because filtered hosts still share their base domain's agency.

### Counts

| Metric | Value |
|---|---|
| Data rows | 29,779. A Python `csv.DictReader` count matched; 0 malformed rows. |
| Rows by base TLD | .gov 26,738 · .mil 2,822 · .com 201 · .edu 18 |
| Unique `base_domain` | 1,396 |
| Base domains with an empty `agency` (dropped) | 6: `armymwr.com, manufacturingusa.com, moneyfactory.com, ndu.edu, tva.com, usps.com` (219 rows) |
| Base domains in `domains.json` | 1,390 (1,213 .gov, 177 .mil) |
| Distinct agencies / agency+bureau pairs | 145 / 392 |
| Base domains with no bureau | 605 of 1,390 |
| Base domains with conflicting agency/bureau pairs | **0** |
| Subdomain overrides (host differs from its base domain) | **0** |

The README's caveat ("does not currently include `.mil/.fed.us/.com/.org`") is **out of date**. The file contains .mil sites with DoD agency and bureau values, plus a few .com and .edu base domains that have no agency.

## Build output: `data/domains.json`

- Built by `node scripts/build-domains.mjs` (Node built-ins only; reads `scripts/.cache/federal-website-index.csv` by default). Set `FWI_COMMIT` and `FWI_FETCHED` env vars to stamp provenance into the file.
- Shape: `{ v: 1, source: {url, commit, fetched, license}, pairs: [[agency, bureau], …], domains: { host: pairIndex } }`. Repeated agency and bureau strings are stored once in `pairs`.
- **Size: 49,881 bytes raw, 14,123 bytes gzip -9.** That is small enough to bundle or lazy-load in the browser.
- **Zero conflicts and zero overrides** shows that agency and bureau are assigned per **base domain**, never per subdomain. The repo's `process/index-creation.md` says the same: it merges agency and bureau in "for its base domain". The subdomain-override pass therefore adds nothing today. It stays in the build as a guard in case GSA changes that.

## Lookup: `scripts/lookup.mjs`

`lookupAgency(input, index)` is pure and dependency-free; it uses only the WHATWG `URL` global. The types are written in a header comment so it can be ported to TypeScript as-is.

How it reads the input:
1. Trims whitespace. Text containing internal whitespace returns `not-a-link`.
2. Adds `https://` when there is no scheme. A non-web scheme (`mailto:`, `javascript:`, `ftp://`) returns `not-a-link`.
3. Lowercases the host, drops a trailing dot, and strips a leading `www.`.
4. Rejects IP addresses and single-label hosts.
5. Tries the exact host, then each parent domain, stopping before the bare TLD.

It returns one of:
- `{status:'match', agency, bureau|null, matchedOn}`
- `{status:'no-match', host}` — `host` is an addition beyond the spec, useful for UI copy
- `{status:'not-a-link'}`

Tests: `node scripts/test-lookup.mjs [--md]`.

## Results

Expected values are the real operator of each site, based on my own knowledge of federal org structure. They are not what the index happens to contain. The **Agency** column checks status plus agency; the **Bureau** column also requires the exact bureau.

| # | Input | Expected (why) | Actual | Agency | Bureau |
|---|---|---|---|---|---|
| 1 | `https://www.ssa.gov/apply/retirement` | Social Security Administration — SSA is an independent agency; no bureau layer | Social Security Administration (via ssa.gov) | PASS | PASS |
| 2 | `https://secure.ssa.gov/` | Social Security Administration — subdomain of ssa.gov; should inherit parent | Social Security Administration (via ssa.gov) | PASS | PASS |
| 3 | `https://www.va.gov/health-care/apply/` | Department of Veterans Affairs / Veterans Health Administration — health-care pages are VHA programs; domain is department-wide | Department of Veterans Affairs / Office of Information and Technology, IT Operations and Services (ITOPS) (via va.gov) | PASS | **FAIL** |
| 4 | `https://www.irs.gov/forms-instructions` | Department of the Treasury / Internal Revenue Service — IRS is a Treasury bureau | Department of the Treasury / Internal Revenue Service (via irs.gov) | PASS | PASS |
| 5 | `https://www.medicare.gov/` | Department of Health and Human Services / Centers for Medicare and Medicaid Services — Medicare is run by CMS | Department of Health and Human Services / Centers for Medicare and Medicaid Services (via medicare.gov) | PASS | PASS |
| 6 | `https://www.healthcare.gov/` | Department of Health and Human Services / Centers for Medicare and Medicaid Services — Marketplace is run by CMS/CCIIO | Department of Health and Human Services / Centers for Medicare and Medicaid Services (via healthcare.gov) | PASS | PASS |
| 7 | `https://travel.state.gov/content/travel/en/passports.html` | Department of State / Bureau of Consular Affairs — passports are Consular Affairs | Department of State / Bureau of Global Public Affairs (via state.gov) | PASS | **FAIL** |
| 8 | `https://my.uscis.gov/` | Department of Homeland Security / Citizenship and Immigration Services — USCIS is a DHS component | Department of Homeland Security / Citizenship and Immigration Services (via uscis.gov) | PASS | PASS |
| 9 | `https://studentaid.gov/` | Department of Education / Federal Student Aid — FSA operates studentaid.gov | Department of Education (via studentaid.gov) | PASS | **FAIL** |
| 10 | `https://www.usajobs.gov/` | Office of Personnel Management — OPM runs USAJOBS | Office of Personnel Management (via usajobs.gov) | PASS | PASS |
| 11 | `https://login.gov/` | General Services Administration / Federal Acquisition Service — Login.gov is GSA TTS, which sits inside FAS | General Services Administration / Federal Acquisition Service (via login.gov) | PASS | PASS |
| 12 | `https://www.usps.com/` | United States Postal Service — USPS is federal (independent establishment); .com domain | no-match | **FAIL** | **FAIL** |
| 13 | `https://www.consumerfinance.gov/` | Consumer Financial Protection Bureau — CFPB is independent | Consumer Financial Protection Bureau (via consumerfinance.gov) | PASS | PASS |
| 14 | `https://www.fema.gov/` | Department of Homeland Security / Federal Emergency Management Agency — FEMA is a DHS component | Department of Homeland Security / Federal Emergency Management Agency (via fema.gov) | PASS | PASS |
| 15 | `https://www.cdc.gov/` | Department of Health and Human Services / Centers for Disease Control and Prevention — CDC is an HHS operating division | Department of Health and Human Services / Centers for Disease Control and Prevention (via cdc.gov) | PASS | PASS |
| 16 | `https://www.nps.gov/` | Department of the Interior / National Park Service — NPS is an Interior bureau | Department of the Interior / National Park Service (via nps.gov) | PASS | PASS |
| 17 | `https://www.fs.usda.gov/` | Department of Agriculture / Forest Service — Forest Service site lives on a USDA subdomain | Department of Agriculture (via usda.gov) | PASS | **FAIL** |
| 18 | `https://www.census.gov/` | Department of Commerce / Bureau of the Census — Census is a Commerce bureau | Department of Commerce / Bureau of the Census (via census.gov) | PASS | PASS |
| 19 | `https://www.tsa.gov/` | Department of Homeland Security / Transportation Security Administration — TSA is a DHS component | Department of Homeland Security / Transportation Security Administration (via tsa.gov) | PASS | PASS |
| 20 | `https://www.dmv.ca.gov/` | no-match — California state site, not federal | no-match | PASS | PASS |
| 21 | `https://www.army.mil/` | Department of Defense / Army — brief listed .mil as a negative case, but army.mil is federal (DoD/Army) and the index now includes .mil | Department of Defense / Army (via army.mil) | PASS | PASS |
| 22 | `https://www.google.com` | no-match — private company | no-match | PASS | PASS |
| 23 | `not a url` | not-a-link — plain text with spaces | not-a-link | PASS | PASS |
| 24 | `ssa.gov` | Social Security Administration — no scheme | Social Security Administration (via ssa.gov) | PASS | PASS |
| 25 | `"  HTTPS://WWW.IRS.GOV/  "` | Department of the Treasury / Internal Revenue Service — whitespace + uppercase + www | Department of the Treasury / Internal Revenue Service (via irs.gov) | PASS | PASS |
| 26 | `ssa.gov:443/x` | Social Security Administration — host:port without scheme | Social Security Administration (via ssa.gov) | PASS | PASS |
| 27 | `mailto:help@ssa.gov` | not-a-link — mailto is not a web link | not-a-link | PASS | PASS |
| 28 | `javascript:alert(1)` | not-a-link — non-http scheme | not-a-link | PASS | PASS |
| 29 | `http://192.168.0.1/` | not-a-link — IP address, not a domain | not-a-link | PASS | PASS |

**Pass rates**
- Cases 1–23 (the 14 links from the brief, 5 extras I chose, 4 negatives): **agency 22/23 (96%)**, **bureau 18/23 (78%)**.
- Input-handling cases 24–29: 6/6.
- Overall: agency 28/29, bureau 24/29.

## Failures and causes

1. **usps.com: no match (agency failure).** `usps.com` *is* in the CSV, but its `agency` and `bureau` are blank, so the build drops it. The same applies to `tva.com`, `moneyfactory.com` (BEP), `manufacturingusa.com`, `armymwr.com` and `ndu.edu`. These are the federal non-.gov sites the index knows about but cannot attribute. Federal .com/.org sites missing from the index altogether are unknowable from this data.
2. **va.gov bureau = "Office of Information and Technology, IT Operations and Services (ITOPS)".** The bureau value is the office that holds the base domain's .gov registration (inferred; see Unverified), not the program office. Every va.gov page, including VHA health care and VBA benefits, would route to VA OIT.
3. **travel.state.gov bureau = "Bureau of Global Public Affairs".** All of `state.gov` inherits the registrant bureau. Passports belong to Consular Affairs.
4. **studentaid.gov bureau is empty.** Federal Student Aid isn't named; the record only says Department of Education.
5. **fs.usda.gov has no bureau.** Forest Service resolves to `usda.gov` with no bureau. Because bureau is assigned per base domain, no department-hosted subdomain (`*.usda.gov`, `*.state.gov`, `*.dhs.gov`, `*.va.gov`) can ever resolve to a component. For example, `*.uscis.dhs.gov` hosts come back as "DHS / Management Directorate".
6. **The .mil "negative" case is not a negative.** The index includes 177 .mil base domains with DoD and service-branch bureaus, so `army.mil` correctly matches DoD/Army. I scored it against reality, not the brief's assumption.

Not failures, but worth knowing:
- `login.gov` and `usa.gov` show "GSA / Federal Acquisition Service". That is correct, since TTS sits inside FAS, but users may not recognize it.
- `defense.gov` shows "DoD / Defense Media Activity", another registrant-office artifact.

## Recommendations

1. **Route on `agency`, treat `bureau` as a hint.** Agency was right in 22/22 matched cases. Bureau is the base-domain registrant office: often right for single-purpose domains (irs.gov, cdc.gov, nps.gov, tsa.gov, fema.gov, census.gov), but misleading on department-wide domains (va.gov, state.gov, defense.gov, dhs.gov).
2. **Mapping to the 20-agency directory's `routingLevel`** (I could not see this directory; it isn't in the repo yet):
   - Key the directory by the index's exact `agency` string.
   - `routingLevel: 'agency'`: ignore bureau and route to the department or agency Section 508 contact.
   - `routingLevel: 'bureau'`: route to a component only when an explicit allowlist maps `(agency, bureau)` to that directory entry, e.g. `("Department of the Treasury","Internal Revenue Service") → IRS`. Otherwise fall back to the agency entry. Never route on bureau strings like "Office of Information and Technology…", "Bureau of Global Public Affairs", "Management Directorate" or "Defense Media Activity".
   - Show the bureau to the user as "Website registered by: …", not as "Responsible office".
3. **Ship a hand-maintained overrides file** (e.g. `data/domain-overrides.json`), merged before the index, with:
   - **Non-.gov federal sites:** `usps.com` (USPS), `tva.com` (TVA), `moneyfactory.com` (Treasury / Bureau of Engraving and Printing), `manufacturingusa.com` (Commerce/NIST), `armymwr.com` (DoD/Army), `ndu.edu` (DoD). Check each one by hand, and add other federal .com/.org sites as users report them.
   - **Host-level bureau corrections** for high-traffic department subdomains: `travel.state.gov` → Consular Affairs, `fs.usda.gov` → Forest Service, `studentaid.gov` → Federal Student Aid, and VA program paths if the product goes path-level.

   The lookup already prefers the more specific host, so overrides keyed by full host just work.
4. **No-match UX.** `no-match` is a real outcome for state, local and private sites and for unknown federal .com sites. Offer a manual agency picker rather than a dead end.
5. **Refresh.** Re-run `curl … && FWI_COMMIT=<sha> node scripts/build-domains.mjs` on a schedule and pin the commit in `domains.json.source`. The build logs conflicts and empty-agency domains to stderr; watch for new ones.

## Unverified / caveats

- The "Expected" agency and bureau values come from my knowledge of federal org structure. I did not check them against an authoritative org chart; Login.gov→FAS and Healthcare.gov→CMS are the most debatable.
- I did not check the CISA dotgov registry directly to confirm that `bureau` is the registrant organization field. That is inferred from `process/index-creation.md` and from the values themselves.
- I could not see the 20-agency directory, its exact agency names, or its `routingLevel` values, so I couldn't test whether agency names match the directory's keys.
- The upstream file changes weekly or more often, so counts will drift from the numbers above, which are for commit `80180f5`.
