# Directory draft notes, part B: DOJ, GSA, OPM, Commerce/Census, USPS (2026-10-03)

Drafted by Claude for `data/agencies.draft.part-b.json`. A human has not verified any of it. Total time was about 10 minutes, 19:20 to 19:30 ET. Per-agency times are rough estimates. The fullest per-agency detail is in each entry's `notes` field. This file is the summary.

## Method

- **Fetching.** I read pages with curl and converted them to plain text.
- **Blocked sites.** These returned 403 or a Cloudflare challenge to curl, so I read them through a scraping service (markdown):
  - commerce.gov (both pages)
  - usajobshelp.opm.gov
  - www.usps.com
- **Regulations.** Text came from the eCFR versioner API (`/api/versioner/v1/full/2026-10-01/title-N.xml?part=…`). That endpoint now needs an `Accept-Encoding` header that allows compression, or it returns HTTP 406. The `ecfr.gov/current/...` URLs in the JSON are the standard links to the same text; I did not load them in a browser.
- **Quote checks.** A script checked every `instructionsQuote` and `filingWindowQuote` against the fetched text, after collapsing whitespace and turning non-breaking spaces into plain spaces. The script cannot see scraped pages, so I checked these by eye against the scraped markdown:
  - USAJOBS webform quote
  - both DOC OCR quotes
  - USPS phone number
- **Census emails.** census.gov hides addresses behind Cloudflare "email-protection" links. I decoded them from the HTML using the standard XOR scheme. **A human should confirm them in a browser.**
- **Not done.** I submitted no forms, sent no messages, and created no accounts. I did not open the Census help-site form, the USAJOBS contact form, or the Login.gov ticket form.
- **New field.** Every channel has `purpose` (`complaint` or `feedback`).

## Section 504 "federally conducted" regulations

| Agency | Part (confirmed on eCFR) | Window section | Window | Notes |
|---|---|---|---|---|
| DOJ | 28 CFR part 39 | §39.170(d)(3) | 180 days | Inmates: 180 days from final BOP decision under 28 CFR 542 |
| GSA | 41 CFR part 105-8 | §105-8.170-4(c) | 180 days | GSA's statement links this section directly |
| OPM | 5 CFR part 723 | §723.170(d) | 180 days | |
| Commerce | 15 CFR part 8c | **§8c.70(d)** (not 8c.170) | 180 days | |
| USPS | 39 CFR part 255 | §255.6(d)(2)(ii) | **null** | See USPS below |

- Each 180-day rule allows the deadline to be extended for good cause.
- 39 CFR 255 is unusual. It is a combined Section 504 and Section 508 rule (§255.1, §255.6(c)), so USPS's 508 process is written into regulation.
- Every regulation's complaint address is older than the address on the agency's current web page. In each case I used the web page and recorded the regulation's address in notes.

## DOJ (about 1.5 minutes, the cleanest)

- **Routing.** `department`. The statement (updated July 1, 2026) has a "Filing a Complaint Alleging a Violation of Section 508" section:
  - email EEOBOXJMD@usdoj.gov
  - fax 202-616-4823 (notes only, because there is no fax channel type)
  - mail to JMD, RMS Staff, 145 N Street NE, Suite 1W.801
  - It states its own 180-day window.
- **Feedback.** The webmaster web form.
- **Conflict.** The regulation's address is 10th and Pennsylvania Ave NW, Room 1232. The web page's address is newer, and I used it.
- **Phone.** I used the main switchboard, 202-514-2000. There is also a comment line, 202-353-1555.
- **Program manager.** Dwayne Spriggs, using the shared mailbox Section508ProgramManager@usdoj.gov. The statement and GSA's listing match.
- **Domains.** justice.gov only. ada.gov and component sites were not checked.

## GSA, covering Login.gov and USA.gov (about 2 minutes)

- **Routing.** `department`. Formal complaints for all three domains go to the GSA Office of Civil Rights.
  - Login.gov's accessibility page has no channels and points to the GSA statement.
  - USA.gov's accessibility policy also points to GSA ("USA.gov's parent agency"). It runs a feedback path of its own: the site-issue form and 1-844-872-4681.
- **Channels.**
  - cio508help@gsa.gov (feedback)
  - OCR, 1800 F St NW, Room 2340 (complaint, mail)
  - USA.gov site-issue form (feedback)
  - The OCR phone numbers are in notes only.
- **Conflicts.**
  - **Federal Relay number.** The statement says 800-777-8339. GSA's civil-rights page says 1-800-877-8339, which is the usual Federal Relay number. The statement's number is probably a typo. **Needs a human check.**
  - **OCR room.** Room 2340 on the statement, Room G224 on the civil-rights page (an EEO/employment contact), and "Civil Rights Division (AKC), 18th and F Streets" in the regulation.
  - **Relay link.** On the civil-rights page, the Speech-to-Speech number's text (1-800-898-0740) does not match its link (tel:+18008778339).
- **Phone.** I used the USAGov Contact Center, 1-844-872-4681. Alternatives are in notes: GSA's National Customer Service Center 1-800-488-3111, and Login.gov 24/7 support (844) 875-6446.
- **Program manager.** Mohammad Islam. The statement and GSA's listing match.

## OPM, covering USAJOBS (about 2 minutes)

- **Routing.** `department`. OPM's page says "To file a complaint against OPM under Section 508, please email section508@opm.gov." OPM lists no separate feedback inbox.
- **USAJOBS.** usajobs.gov/accessibility is 404. The footer "Accessibility" link goes to a Help Center article that sends Section 508 complaints to a "Contact us" form handled by the USAJOBS help desk.
- **Conflict.** The two sites name different complaint channels (email on opm.gov, form on USAJOBS). I marked both as `complaint`. A human may want to re-label the USAJOBS form as `feedback`.
- **Program manager: NULL.** GSA's listing has an empty OPM heading. I confirmed this in the raw HTML. OPM's own page names no program manager.
- **Phone.** 202-606-1800, OPM's general line. I found no USAJOBS phone number.
- **Address in the regulation only.** 5 CFR 723.170(c) gives Assistant Director for Personnel and EEO, Room 1479, 1900 E St NW. It is not used on any page I read, so it is in notes only.

## Commerce / Census (about 2.5 minutes, the hardest)

- **Scope.** The assigned id is `doc`, but the entry covers census.gov only, like `hhs-cms` in batch 1. I suggest renaming it `doc-census`. commerce.gov needs its own department-level entry. Its channels are in the entry's notes.
- **Routing: conflicting sources. I chose `department`; this needs a human decision.**
  - **Census (bureau level).** Census's statement (revised March 18, 2026) has "How To File an Official Accessibility Complaint". It routes to the Census Section 508 Program Office: census.508.accessibility@census.gov, 301-763-1508, or mail to 4600 Silver Hill Rd.
  - **Commerce OCR notice (department level).** The notice (2021) says complaints "against DOC and its bureaus under Section 508" go to DOC OCR, ocr@doc.gov, subject "Section 508 Complaint".
  - **Regulation (department level).** 15 CFR 8c.70 sends complaints to DOC OCR.
  - **Why `department`.** The regulation and the department notice, which explicitly covers bureaus, agree. Both sets of channels are in the entry as `complaint`, because Census explicitly calls its path the "official complaint" path. Neither page mentions the other's path.
- **Other conflicts.**
  - The Commerce statement lists 301-763-1508 as the DOC OCR complaint phone. Census lists the same number for its own 508 office.
  - The OCR room is Rm 6058 on the web pages and Room 6012 in the regulation.
- **Program manager.** GSA lists David Whittington (david.j.whittington@census.gov) for Census. The Census page shows only the shared census.508.accessibility@census.gov inbox for him. DOC's agencywide program manager is Jennifer Jessup (jjessup@doc.gov).
- **Phone.** 1-800-923-8282, the Census Call Center (TTY 1-800-877-8339).

## USPS (about 2 minutes)

- **Statement.** https://about.usps.com/who/legal/accessibility-statement/ (updated July 12, 2023). It is linked from the www.usps.com footer. www.usps.com/accessibility is 404.
- **Routing.** `department` (independent agency).
- **Two-step process, not seen at any earlier agency:**
  1. **Informal complaint.** The complainant tells "the responsible postal manager orally or in writing". USPS gives no address, email, or form for this step, so it has no channel. A written decision is due by day 60.
  2. **Formal complaint.** Only if relief is denied, the complainant may file a formal complaint by mail to the Vice President and Consumer Advocate, 475 L'Enfant Plaza SW, within 30 days of receiving the denial.
- **Feedback.** Section508@usps.gov.
- **filingWindowDays: null on purpose.** 39 CFR 255 sets no deadline after the barrier for the informal step. Its only deadline is the 30-day formal window, counted from the denial. The source and quote fields point at that rule so the UI can explain it. **Needs a human decision on how to display it.**
- **Domains.**
  - **usps.gov: confirmed.** whois.nic.gov gives the registrant organization "United States Postal Service". CISA's .gov registry CSV lists it under USPS. It 301-redirects to www.usps.com.
  - **usps.com: confirmed, indirectly.** It is the redirect target of the USPS-registered usps.gov, and it hosts the footer link to the USPS accessibility statement. Its public WHOIS names no organization (only a Raleigh, NC street address).
- **Phone.** 1-800-ASK-USPS (1-800-275-8777). USPS Technical Support for web applications, 1-800-344-7779, may fit web barriers better. A human should choose.
- **Program manager.** Nadereh Nasir (nadereh.nasir@usps.gov) on GSA's listing. The USPS statement names no program manager.

## Cross-cutting notes for the human reviewer

1. **Regulation addresses are stale.** Every regulation's complaint address is older than the agency's current web page. The pages should win, but the conflicts are logged per entry.
2. **The department-or-bureau call is not always clean.** For IRS and CMS in batch 1, the bureau's own page pointed to the department. For Census, the bureau names its own "official complaint" path while the department claims all bureau complaints.
3. **USPS breaks the "N days from the barrier" model.** The UI needs a way to show a two-step process.
4. **There is no `phone` channel type.** That leaves out real oral-complaint lines: GSA OCR 202-501-0767, the Census 508 office 301-763-1508, and DOJ fax 202-616-4823.
5. **Shared files changed while I worked.** `data/agencies.draft.json` now has `purpose` on its channels, and new files `agencies.draft.part-c.json`, `program-managers.json` and `domain-overrides.json` appeared. Other processes edited these; I did not touch them.
