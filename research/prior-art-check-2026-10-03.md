# Prior-art check: Barrier Report (2026-10-03)

Time-boxed (~30 min) third-round check. "Verified" = I fetched the page this session and read its content (via fetch tool; some pages were read through a summarizing fetcher, noted where relevant). "Search-only" = seen only as a search-result snippet.

## Verdict

No new free tool turned up that does both federal agency routing from a URL and first-person Section 508 complaint drafting. That includes anything released in 2025–2026. The prior conclusion still holds, and I'd put confidence at medium-high, unchanged. The closest new item is **Access Atlas** (GitHub, MIT, active Sept 2026). It works out a site's owner and which law applies (incl. Section 508), but it is a developer-facing audit CLI and Claude Code plugin. It does not file or draft public complaints. GSA's section508.gov still has no public complaint portal and no machine-readable directory of agency complaint channels. Its Program Manager listing is HTML only, and its contact page only covers issues with section508.gov itself. One trend is worth tracking: general-purpose LLMs are now widely used to draft disability complaints (ADA Title III). That makes "ask ChatGPT" the realistic substitute, not a dedicated tool.

## What I searched

- **Web (general):** `"Section 508 complaint" generator tool federal agency 2026`; `tool identify federal agency from URL file Section 508 complaint draft letter disability` (extended); `report inaccessible federal website tool 2026 accessibility complaint letter generator AI` (extended); `"Section 508" complaint "which agency" tool OR app OR wizard inaccessible federal website` (extended)
- **Chrome Web Store** (domain-restricted): `chrome extension "report accessibility" issue website complaint`
- **Firefox add-ons** (domain-restricted): `accessibility complaint report barrier add-on`
- **GitHub API repo search:** `"508 complaint"`, `section 508 complaint`, `accessibility complaint federal`, `accessibility complaint generator`, `accessibility complaint letter` (all 0 results); `accessibility complaint` (102), `section 508 report` (16), `report accessibility barrier` (33), `federal agency accessibility` (10), `barrier report`, `barrier-report in:name`, `barrierreport in:name`, `"508" complaint in:readme federal agency`
- **Firecrawl developer index:** `section 508 complaint generator federal agency`
- **ACB / NFB / AFB** (domain-restricted): `Section 508 complaint federal website report tool 2026`; `nfb.org report accessibility barrier inaccessible website form`
- **section508.gov / gsa.gov / usa.gov / access-board.gov** (domain-restricted): complaint portal / file a complaint queries; fetched the complaints best-practices page, program-manager listing and contact page
- **USA.gov:** `report inaccessible government website disability complaint Section 508`; fetched /disability-rights
- **Name check:** `"Barrier Report" accessibility`; `"BarrierReport" OR "Barrier Report" app tool civic tech`; `"Barrier Report" disability website complaint tool -university` (extended); DNS lookups for barrierreport.{com,org,app,io} and barrier.report
- **CFPB:** CFPB accessibility pages; 12 CFR 1072 and 1092; 29 U.S.C. 794d; 44 U.S.C. 3502; Access Board E103.4

## Closest matches (new this round)

| Name | URL | What it does | Routes to federal agency? | Drafts complaint? | Free? |
|---|---|---|---|---|---|
| Access Atlas (teamnebula-ai) — verified | https://github.com/teamnebula-ai/access-atlas | CLI/Claude Code plugin. Detects a site's owner, picks the law that applies (ADA Title II, 508, US states, EU), grades WCAG failures and writes AI fix prompts | Identifies the owner and the law, but has no complaint routing | No (audit scorecards for site owners) | Yes, MIT |
| section508.gov Program Manager listing — verified | https://www.section508.gov/tools/program-manager-listing/ (the old /coordinator-listing redirects here) | HTML directory of agency 508 program managers (lists CFPB under Small and Independent Agencies); "Reviewed/Updated: August 2026" | Contacts only, not complaint channels; no CSV/JSON seen | No | Yes |
| section508.gov complaints best practices — verified | https://www.section508.gov/manage/laws-and-policies/section-508-complaints-best-practices/ | Guidance telling agencies how to run 508 complaint processes; links example agency forms (DHS, VA, SSA, USDA); "Reviewed/Updated: August 2024" | No | No | Yes |
| NFB Sample Letter — verified (summary) | https://nfb.org/programs-services/center-excellence-nonvisual-access/self-advocacy-reporting-inaccessibility-1 | Static sample letter reporting a website barrier, aimed at businesses (checkout-form example) | No | Static template only | Yes |
| NFB Inaccessibility Tracker Form — verified (summary) | https://nfb.org/programs-services/center-excellence-nonvisual-access/inaccessibility-tracker-form | Collects reports of inaccessible software for NFB's own tracking; says submissions get no direct response | No | No | Yes |
| A11y-barrier-reporting-automation — verified | https://github.com/liyangstearns1225/A11y-barrier-reporting-automation | Intake automation for organizations receiving feedback (mailbox to SharePoint) | No | No | Code is public |
| special-education-due-process-complaint — search-only | https://github.com/b33kman/special-education-due-process-complaint | Repo description: "free AI plugin for Claude and ChatGPT" that writes special-ed due process complaints. Same pattern as ours, different domain | N/A | Yes (other domain) | Per description |
| USA.gov disability rights — verified | https://www.usa.gov/disability-rights | Points to an ada.gov chart for choosing an agency for disability discrimination complaints; no 508/website routing seen | ADA-focused; not by URL | No | Yes |

Chrome/Firefox stores only returned auditing extensions (WAVE, axe, IBM Equal Access, ANDI port, etc.). None were complaint tools. A generic "Report website issues" Chrome extension (https://chromewebstore.google.com/detail/report-website-issues/ligflmchialjgapdcgadgibgkabckglh) appeared, but its detail page didn't render for me, so I couldn't check it.

The previously known adjacent tools (Ezel.ai, Report Inaccessibility, Accesserty Signal, ACB guide, well-known URI draft) were not re-examined in depth. A search for reportinaccessibility.com plus federal/508 surfaced nothing new.

## Name check: "Barrier Report"

- **Verified (search results):** "Barrier Report" / "Report a Barrier" is a very common **generic label for university accessibility intake forms**. Examples: Goucher "Barrier Report Form" (https://goucher.edu/accessibility-services/barrier-report-form), U-Michigan (https://accessibility.umich.edu/how-to/manage/report-barrier), USC (https://accessibility.usc.edu/report-a-barrier/), Pitt, UChicago, GWU, RIT, and WA ESD's "Accessibility Barriers Report Form" (https://esd.wa.gov/about-us/who-we-are-and-what-we-do/policies/digital-accessibility-policy-and-plan/accessibility-barriers-report-form). Related apps: U-M "Access U-M" (https://si.umich.edu/about-umsi/news/umsi-students-help-develop-report-barrier-app-support-campus-accessibility); Croatian "Barrier Tracker" (environmental, https://www.haop.hr/hr/record-barrier-watercourse-just-few-clicks-download-free-app-barrier-tracker).
- **I found no branded product, app or civic-tech tool called "Barrier Report"** in web or GitHub searches. The only GitHub name hit, `bradcranston/ck_barrierReport`, is a FileMaker JS dev-kit template (verified via GitHub API/README).
- **DNS (verified via dig):** barrierreport.com has Cloudflare nameservers (registered) but no A record. barrierreport.org, .app, .io and barrier.report returned no NS records, so they are probably unregistered (not a WHOIS check).
- **Takeaway:** low collision risk with any product, but the name is generic. It will share search results with many university forms, and "barrier report" means "intake form" to accessibility staff. A qualifier helps, e.g. "Barrier Report: federal 508 complaints".

## CFPB coverage

**Answer: Yes. Section 508 covers CFPB the same way it covers cabinet departments. CFPB has its own 504/508 complaint regulation at 12 CFR part 1072, not part 1092.**

Verified:
1. **Statute.** 29 U.S.C. 794d(a)(1)(A) applies to "each Federal department or agency, including the United States Postal Service". Under (f)(2), complaints are filed with the agency itself, which applies its Section 504 (794) complaint procedures. The statute has no standalone definition. https://www.govinfo.gov/content/pkg/USCODE-2022-title29/html/USCODE-2022-title29-chap16-subchapV-sec794d.htm
2. **Standards definition.** Access Board 508 Standards E103.4 define "Agency" as any agency or department "as defined in 44 U.S.C. 3502, and the United States Postal Service." https://www.access-board.gov/ict/
3. **44 U.S.C. 3502.** (1) "agency" includes "any independent regulatory agency". (5) lists "the Bureau of Consumer Financial Protection" by name. https://www.law.cornell.edu/uscode/text/44/3502
4. **CFPB regulation = 12 CFR part 1072**, "Enforcement of Nondiscrimination on the Basis of Disability in Programs and Activities Conducted by the Bureau of Consumer Financial Protection". Authority: 29 U.S.C. 794; 29 U.S.C. 794d. https://www.law.cornell.edu/cfr/text/12/part-1072
   - §1072.112 (compliance procedures) covers section 504 or section 508 complaints. Its deadline is "A complete complaint must be filed within 180 days of the alleged act of discrimination". The regulation's address is Labor and Employee Relations, Office of the Chief Human Capital Officer, CFPB, 1700 G Street NW, Washington DC 20052. https://www.law.cornell.edu/cfr/text/12/1072.112
   - CFPB's rule page states the complaint mechanism also covers section 508 EIT complaints. https://consumerfinance.gov/rules-policy/final-rules/enforcement-nondiscrimination-basis-disability-programs-and-activities-conducted-bureau-consumer-financial-protection
5. **12 CFR part 1092 is "Nonbank Registration"**, which has nothing to do with disability. https://www.law.cornell.edu/cfr/text/12/part-1092
6. **CFPB accessibility page** commits to Sections 504 and 508. It lists CFPB_Accessibility@consumerfinance.gov (feedback), CFPB_504Request@consumerfinance.gov, and the 508 coordinator at CFPB_Accessibility@cfpb.gov, and links the complaint page. https://www.consumerfinance.gov/accessibility/
7. **CFPB "File accessibility complaint" page** ("Page last modified Jun. 29, 2026"):
   - It covers 504, 508 and ABA.
   - Complaints are due within 180 days, and CFPB responds within 180 days. Appeals are due within 30 days.
   - Contact: email CFPB_EEO@cfpb.gov, or mail to Office of Civil Rights, CFPB, 445 12th Street SW, Washington DC 20024. Fax (202) 435-9598.
   - A complaint must include name and address, the date, a detailed description, and a signature.
   - The page links the 2012 Federal Register rule (http://www.gpo.gov/fdsys/pkg/FR-2012-08-06/pdf/2012-18827.pdf).
   - https://www.consumerfinance.gov/accessibility/file-accessibility-complaint/

**Discrepancy to handle in the app:** the regulation (§1072.112) names LER/OCHCO at 1700 G St NW. CFPB's current web page (June 2026) names the Office of Civil Rights at 445 12th St SW, with email CFPB_EEO@cfpb.gov. Barrier Report should use the agency's current published channel, the web page, and link the regulation.

## Unverified items

- eCFR (ecfr.gov) redirected to an unblock page, so I relied on Cornell LII for the CFR text, not the official eCFR.
- The Federal Register citation, doc 2012-18827, 77 FR 46606, Aug 6 2012, interim final rule, comes from a search snippet (https://www.federalregister.gov/documents/2012/08/06/2012-18827/enforcement-of-nondiscrimination-on-the-basis-of-disability-in-programs-and-activities-conducted-by). The govinfo PDF didn't parse. My fetch summary of CFPB's rule page said "August 6, 2013", which conflicts with the 2012 FR date. I believe 2012 is correct, but I haven't confirmed it.
- I didn't check whether CFPB issued a later final rule replacing the 2012 interim final rule.
- The NFB pages returned 403 to the direct fetch, so I read them via a Firecrawl summary, not full text.
- Owner and use of barrierreport.com are unknown (no WHOIS). I didn't run a USPTO trademark search.
- The search-snippet claim that the Access Board takes "Section 508 related complaints" via its Chief of Staff appears to be about complaints against the Board itself. I didn't confirm it (source: https://www.access-board.gov/about/policy/accessibility.html).
- The 2026 claims about AI-drafted pro se ADA complaints and a USWDS leadership change come only from search summaries of https://accessibility.build/guides/ai-accessibility-lawsuits and related pages. I didn't read those pages.
- The b33kman repo is described from its GitHub description only.
