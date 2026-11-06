# Directory draft notes: part C (SBA, DOT, DOI, NARA, CFPB), 2026-10-03

Drafted by Claude for `data/agencies.draft.part-c.json`. A human has not verified anything here. Total time was about 9 minutes, from 19:20 to 19:29 ET. Per-agency times are rough wall-clock estimates.

## Schema addition

Every channel now has a `purpose` field:

- `"complaint"`: a formal Section 508 / 504 complaint channel that the agency names.
- `"feedback"`: an accessibility help or feedback channel.

`routingLevel` follows where formal complaints go. All five agencies are top-level (independent agencies or cabinet departments) and take complaints themselves, so every entry is `"department"` with `parent: null`.

## How the pages were read

- **Direct fetch.** Most pages came through plain curl with a browser user-agent and a small stdlib HTML-to-text script: sba.gov, doi.gov (except contact-us), archives.gov, consumerfinance.gov, and section508.gov.
- **Scraping service (markdown).** transportation.gov returned HTTP 403 to curl, and doi.gov/contact-us returned an Akamai bot challenge, so I read those through a scraping service.
- **Regulations.** CFR text came from the eCFR versioner API (`/api/versioner/v1/full/{date}/title-N.xml?part=..&section=..`). That endpoint now **requires `Accept-Encoding` compression** (use `curl --compressed`), which is a new gotcha. The eCFR search API returned non-JSON, so I found the parts by walking `/api/versioner/v1/structure/{date}/title-N.json` for headings containing "handicap"/"disability".
- **Quote checks.** A script checked every `instructionsQuote` and `filingWindowQuote` against the fetched text, ignoring whitespace and nbsp. The DOT statement quote is the exception: I checked it by eye against the scraped markdown.
- I did not submit forms, send messages, or create accounts.

## Section 504 "federally conducted" regulations (verified on eCFR)

| Agency | Part | Section | Window | eCFR date |
|---|---|---|---|---|
| SBA | 13 CFR part 136 | §136.170(c)(3) | 180 days (AA/EEOCCR may extend for good cause) | 2026-09-29 |
| DOT | 49 CFR part 28 | §28.170(d)(1) | 180 days | 2026-10-01 |
| DOI | 43 CFR part 17, **subpart E** (not a separate part) | §17.570(d)(1) | 180 days | 2026-08-12 |
| NARA | 36 CFR part 1208 | §1208.170(d) | 180 days | 2026-09-23 |
| CFPB | 12 CFR part 1072 | §1072.112(d)(3) | 180 days | 2026-10-01 |

Every part heading names the agency explicitly ("...Conducted by the Small Business Administration", etc.). DOI's own statement cites "43 CFR Part 17, Subpart E". CFPB's §1072.112(a) explicitly covers "denial of access to electronic and information technology".

## SBA (about 2 min)

- **Clean.** One inbox handles both help and formal complaints: 508complaints@sba.gov, under the heading "Help, feedback, and formal complaints". A separate 508@sba.gov takes "questions or comments".
- **Statement URL.** `sba.gov/accessibility` redirects to `/about-sba/open-government/about-the-sba-gov-website/#accessibility`.
- **Missing:**
  - No mail address or form on the page.
  - No public SBA page for 504 complaints turned up in a quick search.
  - No "last updated" date on the page.
- **Conflict.** 13 CFR 136.170(c)(4) gives AA/EEOCCR, 1441 L Street NW, Room 501, DC 20416. That address appears only in the regulation and is probably stale. I recorded it in notes only.
- **Phone choice for a human.** The statement says "For immediate help, call 202-205-6750", which may fit "ask for another way" better than the Answer Desk (1-800-827-5722), the number I used.

## DOT (about 3 min, the hardest)

- **No formal 508/504 complaint channel is published for DOT's own ICT.** The Digital Accessibility Statement (updated September 29, 2026) offers only Section508@dot.gov (feedback).
  - 49 CFR 28.170(c) assigns complaints to the Director, Departmental Office of Civil Rights (DOCR), but gives no address.
  - DOCR's Public Complaint Form (Google Forms) covers entities "regulated by or receiving Federal financial assistance from" DOT, not DOT itself, and does not mention 508. It also links two different forms.gle URLs. I left it out of channels.
- **Possible lead (unverified):** usdot.civilrights@dot.gov handles disability and language assistance for the DOCR process.
- **Phone.** I used 202-366-4000 (Customer Service Center).
  - Its hours differ by page: 8:30–5:30 on the contact page (updated 2021) versus 8:30–5:00 on the /accessibility page (updated 2025).
  - The footer also shows an unlabeled 855-368-4200.
- **Program managers.** GSA lists an agencywide PM, a deputy, and separate PMs for 11 operating administrations and offices. The statement also gives the PM's phone, 202-836-1303.
- **Scope.** domains lists only transportation.gov. I did not check OA sites (faa.gov, nhtsa.gov, etc.).

## DOI (about 1.5 min)

- **Purpose ambiguity.** section508@ios.doi.gov (the PM inbox) is named for "feedback, concerns, suggestions, or to file a Section 508 complaint". I marked it `complaint`, but it doubles as the feedback channel. A human should decide.
- **Formal mail.** Director, Office of Civil Rights, Mail Stop 4359, 1849 C Street N.W., DC 20240. The page says OCR applies 43 CFR Part 17, Subpart E.
- **Address variants.**
  - Regulation: "Director, Office for Equal Opportunity ... Washington, DC 20240" (old office name, no street).
  - Public Civil Rights page: 1849 C Street NW, without the mail stop.
- **Statement date.** Last modified 4/1/2024.
- **Bureaus.** Bureaus (NPS, BLM, FWS, USGS, etc.) have their own sites and their own GSA-listed PMs. I did not check how their sites route formal complaints, so domains lists only doi.gov.

## NARA (about 1 min)

- **Feedback:** 508feedback@nara.gov.
- **Complaint path.** The "Section 508 & Architectural Barriers Notice of Rights" (reviewed 2024) gives Section 508 Coordinator, 8601 Adelphi Road, Room 4400, College Park, MD 20740-6001, tel. 301-837-0634. It offers this address "For information about filing a complaint", not explicitly as the place to file. I marked it `complaint` because it is the only path NARA names.
- **Conflict.** 36 CFR 1208.170(c) says "Compliants [sic] may be sent to National Archives and Records Administration (NA), Washington, DC 20408".
- **Program manager.** The page names Farooq Khan with the shared inbox. GSA gives farooq.khan1@nara.gov.

## CFPB (about 1.5 min)

- **Confirmed: CFPB_EEO@cfpb.gov.** The complaint page (last modified June 29, 2026) sends formal 504/508 complaints to the Office of Civil Rights by:
  - email: CFPB_EEO@cfpb.gov
  - fax: (202) 435-9598 (in notes only; the schema has no fax type)
  - mail: 445 12th Street SW, DC 20024
- **Conflict (recorded both ways, page first).** 12 CFR 1072.112(c) names Labor and Employee Relations, OCHCO, 1700 G Street NW, DC 20052.
- **New finding, email domain conflict.** The page body and statement use **CFPB_Accessibility@cfpb.gov**, but the "Accessibility feedback" sidebar on both pages uses **CFPB_Accessibility@consumerfinance.gov**. The sidebar also has CFPB_504Request@consumerfinance.gov, which is for accommodation requests.
  - The earlier prior-art note recorded only the @consumerfinance.gov forms, probably from the sidebar.
  - I used the body address.
- **Program manager.** GSA lists Jennifer Horan. CFPB's pages name no PM.

## Cross-cutting issues for the human reviewer

1. **DOT gap.** DOT is the first agency so far with **no published formal complaint channel** for its own ICT. The app needs a fallback for this case, such as "email the 508 inbox and say you want to file a formal Section 508 complaint under 49 CFR 28.170".
2. **Stale regulation addresses.** SBA, NARA, DOI, and CFPB all list complaint addresses in their regulations that differ from current web pages. In every case I used the web page and moved the regulation address to notes, except CFPB, where the task said to record both.
3. **Ambiguous inboxes.** Several agencies route feedback and formal complaints to one inbox (SBA, DOI). The binary `purpose` field can't express "both"; a `"both"` value or a boolean may be worth adding.
4. **Unverified statute link.** The 508-to-504-procedures link (29 U.S.C. 794d(f)(2)) is still from background knowledge, as in batch 1.
