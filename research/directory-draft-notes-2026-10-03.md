# Directory draft notes: first 5 agencies (2026-10-03)

Drafted by Claude for `data/agencies.draft.json`. Nothing here has been verified by a human. Total time was about 15 minutes, from 18:55 to 19:10 ET. Per-agency times below are approximate wall-clock estimates.

## How the pages were read

- I fetched pages with curl and read them as plain text. The `.gov` sites below blocked plain curl with HTTP 403, so I read those through a scraping service that returned markdown:
  - ssa.gov HTML pages (the SSA-437 PDF downloaded fine)
  - hhs.gov
  - travel.state.gov
- ecfr.gov HTML sends bots to an "unblock" page. I read the regulation text from the eCFR versioner API (`/api/versioner/v1/full/2026-10-01/...`). The `ecfr.gov/current/title-N/section-X` URLs in the JSON are the standard links to that same text, but I did not load them in a browser.
- I checked every `instructionsQuote` and `filingWindowQuote` against the fetched text with a script. The only exception is the SSA accessibility-page quote, which I checked by eye against the scraped markdown.
- I did not submit any forms, send any messages, or create any accounts.

## Section 504 "federally conducted" regulations (filing windows)

| Agency | Part | Section | Window | Notes |
|---|---|---|---|---|
| VA | 38 CFR part 15 | §15.170(d) | 180 days | Guess confirmed. |
| Treasury (covers IRS) | 31 CFR part 17 | §17.170(d)(3) | 180 days | |
| State | 22 CFR part 144 | §144.170(d) | 180 days | |
| HHS (covers CMS) | 45 CFR part 85 | §85.61(d) | 180 days | |
| SSA | none found | | | No SSA-specific part in Title 20; "20 CFR part 365" was not confirmed. See SSA below. |

Each of these regulations also says the agency may extend the deadline for good cause.

## SSA (about 4 minutes, the hardest)

- **Easy:**
  - The accessibility page (updated 10/03/2026) is clear: feedback goes to Section508@ssa.gov, and formal 508 complaints go to form SSA-437 under "Notice of Rights".
  - The program manager on the page matches GSA's listing.
- **Missing or ambiguous:**
  - I found no SSA-specific 504 regulation. SSA's own page links "Section 504 Regulation 45 C.F.R. Part 85", which is the HHS rule, and that rule defines "agency" as HHS.
  - The 180-day window is stated directly on SSA-437 (09-2026). The CFR citation in the JSON is the one SSA itself points to, and it needs legal review.
  - SSA-437 is a general program-discrimination form, not a 508-specific one.
- **Conflicts:** none between pages.
- **Other contacts:** the Section 504 inquiry line and email (1-844-881-9061, section.504.public.inquiry@ssa.gov) are recorded in notes only. They are for 504 help, not 508 complaints.

## VA (about 2 minutes)

- **Easy:**
  - The "Accessibility at VA" page gives Section508@VA.gov, names the program manager, and gives a phone number for when an issue blocks a task.
- **Missing:**
  - VA describes no formal 508 complaint process. The only formal path is the ORM External Complaints Program, which is for general/504 discrimination and does not mention 508.
- **Conflict:**
  - 38 CFR 15.170(c) gives the address as 810 Vermont Avenue NW with no suite.
  - The web page gives "810 Vermont Ave, NW Suite 275" with ORM/ECP attention lines. I used the web page.
- **Gotchas:**
  - Phone numbers sit inside `<va-telephone>` web components, so naive text extraction silently drops them.
  - The accessibility page's number (866-279-3677, VA.gov tech support) arguably fits the "ask for another way" advice better than MyVA411 (800-698-2411). The JSON uses MyVA411 as the main line and names 866-279-3677 in notes. This needs a human decision.

## IRS / Treasury (about 3 minutes)

- **Routing finding:**
  - Formal 508 complaints about IRS go to Treasury. IRS's own "Accessibility - Notice of rights" page says to send a signed written complaint within 180 days to the U.S. Department of the Treasury, Office of Civil Rights and Diversity.
  - The relevant bureau (IRS) then investigates the complaint.
  - IRS handles only feedback channels itself: the web form on irs.gov/accessibility and 508@irs.gov for program questions.
  - So `routingLevel: "department"`, `parent: "Department of the Treasury"`.
- **Missing:**
  - The Notice of Rights page is not linked from irs.gov/accessibility. I found it through web search.
  - Pub 4053-C returned 404.
  - Pub 4053 is from 2012, covers federally assisted sites, and I did not use it.
- **Conflict:** three different names for the Treasury office.
  - IRS page: "Office of Civil Rights and Diversity"
  - Treasury physical-accessibility page: "Office of Civil Rights and Equal Employment Opportunity", with crcomplaints@treasury.gov
  - 31 CFR 17.170(c): "Office of Equal Opportunity Program"
- **Also:**
  - Treasury's web-accessibility page (last reviewed 2024) has a "File a Formal Section 508 Complaint" link to crcomplaints@treasury.gov, but it is framed around treasury.gov. I did not add it as an IRS channel.
  - Oral complaints can be made at 202-622-1160 (Federal Relay 866-377-8642). The schema has no phone channel type, so this is in notes only.
- **Program manager:** GSA lists two IRS names with no designation (Davenport, Shavers). The JSON holds the first, and both are in notes.

## HHS / CMS (about 2 minutes)

- **Routing finding:**
  - All three CMS sites send accessibility feedback to the CMS Section 508 Team at 508Feedback@cms.hhs.gov.
  - Formal "508 complaints" go to HHS, per CMS's own notice. So `routingLevel: "department"` and the id is `hhs-cms`.
- **Conflict:** the CMS "508 complaints" block is internally inconsistent.
  - It names the HHS **Office for Civil Rights** and OCR's email (OCRComplaint@hhs.gov).
  - But the mailing address it gives is the **Office of Equal Employment Opportunity**, Room 308B.
  - OCR's own complaint page uses Centralized Case Management Operations, Room 509F.
- **Stale or broken pages:**
  - The HealthCare.gov accessibility page says "Last Updated: 10/23/2013".
  - The old HHS 508 URL (`/web/section-508/accessibility/`) is 404. The working page is hhs.gov/accessibility/, last reviewed in 2023.
- **Program managers:** CMS PM, CMS Deputy PM, HHS agencywide PM, and the HHS help desk are all recorded.

## State (about 2 minutes, the cleanest)

- **Easy:**
  - One department-wide statement (updated 8/5/2026) covers travel.state.gov through its "Accessibility Support" footer link.
  - It gives section508@state.gov for feedback.
  - For complaints, it gives a Discrimination Complaint Form (Microsoft Forms link) and SOCR_Direct@state.gov.
- **Missing:**
  - No public mailing address. 22 CFR 144.170(c) has one (2201 C Street NW, Room 3214), but the office title may be outdated. I recorded it in notes only.
  - No general state.gov help line. I used the passport line (NPIC 877-487-2778).
- **Minor differences:**
  - Program manager email capitalization differs between State's page and GSA's listing.
  - The travel.state.gov footer has a malformed "GSA.gov" link.

## Cross-cutting issues for the human reviewer

1. Several agencies split feedback (agency 508 inbox) from formal complaints (civil rights office, sometimes at the parent department). The UI should probably show both paths, not pick one.
2. Every filing window comes from a Section 504 "federally conducted" regulation. My understanding is that Section 508 complaints use those procedures under 29 U.S.C. 794d(f)(2). That comes from background knowledge, and I did not verify the statute text this session.
3. I left `lastChecked` and `checkedBy` null on purpose. Every non-null field still needs human confirmation.
