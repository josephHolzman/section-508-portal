# Verification queue (drafted 2026-10-03)

Every entry in `data/agencies.draft*.json` is unverified. The app treats them as unverified (it routes to the program manager) until `lastChecked` is set. To try the agency-specific paths locally, run `VITE_DRAFT_DIRECTORY=verified npm run dev`; a "Draft data" warning shows on Send.

To verify an entry: open every URL in its `sources`, confirm each field, then set `lastChecked` (YYYY-MM-DD) and `checkedBy`. `npm test` checks the data's shape on every run.

Below are the calls the research couldn't make for you. Details and quotes are in each part's notes file in this folder.

## Routing decisions

| Agency | Decision needed |
| --- | --- |
| Census (`doc-census`) | Census names its own 508 office as the official path; Commerce's notice and 15 CFR 8c.70 cover "DOC and its bureaus" via ocr@doc.gov. Entry is set to department level with both paths marked complaint. Pick one. |
| USCIS (`dhs-uscis`) | USCIS says to email its 508 office to "file a 508 complaint," but it's unclear whether USCIS decides these or passes them to DHS CRCL. Bureau level for now. |
| FEMA (`dhs-fema`) | FEMA's pages conflict: 5 civil-rights emails, 3 phone numbers, 2 mail recipients. Pick the current one. |
| Education (`ed`) | The only path, ITAPSupport@ed.gov, sits under "Available complaint processes" but reads like a help desk. Marked complaint. |
| Labor (`dol`) | The Civil Rights Center's external complaint page targets DOL-funded programs; using it for 508 is an inferred match. |
| Interior (`doi`) | section508@ios.doi.gov takes both feedback and complaints; marked complaint. |
| NARA (`nara`) | The page gives the College Park address "for information about filing a complaint," not explicitly as where to file. The rule has a different address. |
| Transportation (`dot`) | No formal complaint channel published. The app sends to Section508@dot.gov and says so. Confirm nothing better exists. |
| USPS (`usps`) | 39 CFR 255 requires an informal complaint first (no channel named), then a formal complaint by mail within 30 days of a denial. `filingWindowDays` is null on purpose. The Send copy may need a USPS-specific note. |
| OPM (`opm`) | section508@opm.gov vs. the USAJOBS help-desk form: both marked complaint. GSA lists no program manager. |
| SSA (`ssa`) | No SSA-specific 504 rule found in 20 CFR; SSA's page cites HHS's rule (45 CFR 85). The 180 days is stated on form SSA-437. |

## Contact conflicts

| Agency | Conflict |
| --- | --- |
| VA | Street address differs between 38 CFR 15.170 and the web page (page used). Phone: MyVA411 (800-698-2411) vs. the accessibility page's 866-279-3677, which may fit "ask for another way" better. |
| IRS / Treasury | Treasury's civil rights office has three names across pages. GSA lists two IRS program managers. |
| CMS / HHS | CMS names HHS's Office for Civil Rights but gives another HHS office's mailing address. HealthCare.gov's accessibility page dates from 2013. |
| DHS / TSA | Program manager differs between GSA (Lockley) and TSA's page (Byrne). CRCL's email, fax and mail option now redirects to its portal. |
| Labor | Program manager differs between GSA (Eric W. Wright) and DOL's page (Brandon Jubar). |
| GSA | The statement's Federal Relay number (800-777-8339) looks like a typo of 1-800-877-8339. The Office of Civil Rights room number differs across pages. |
| CFPB | The page body says CFPB_Accessibility@cfpb.gov; the sidebar says @consumerfinance.gov. The rule's address (1700 G St NW) differs from the page's. |
| SBA | The rule's mailing address (1441 L St NW) is probably stale; it's in notes only. |
| DOJ | The rule's address is older than the web page's (page used). |

## Program manager listing (`data/program-managers.json`)

- Education, OPM and 5 components list no manager. DOE's two managers have no email; only the helpdesk does.
- The NTIS and NTIA emails look swapped on GSA's page. Some names don't match their email spelling.
- The FEC is excluded from Section 508 by 44 U.S.C. 3502(1)(B), yet lists a 508 manager with GSA.

## Coverage (`data/coverage.json`)

24 index owners are classed as not covered (legislative, judicial, GAO, FEC and others) and 14 as unclear. 16 "covered" rows were marked lower confidence in `research/section-508-coverage-2026-10-03.md`. The app shows a soft "may not apply" notice for not-covered offices and doesn't block them.
