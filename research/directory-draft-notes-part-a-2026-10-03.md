# Directory draft notes, part A: DHS (TSA, USCIS, FEMA), ED (FSA), DOL, USDA, HUD (2026-10-03)

Drafted by Claude for `data/agencies.draft.part-a.json`. Nothing here has been verified by a human.

The batch took about 15 minutes, from 19:20 to 19:36 ET. Per-agency times are rough wall-clock estimates.

This batch adds a `purpose` field to every channel:
- `complaint`: a formal 508/504 complaint path that the agency names.
- `feedback`: a help or feedback path.

`routingLevel` follows where formal complaints go.

## How the pages were read

- **Plain curl** worked for dhs.gov, uscis.gov, tsa.gov, hud.gov and section508.gov. I converted the HTML to text with a small script.
- **HTTP 403 to plain curl** for fema.gov, ed.gov, dol.gov, usda.gov and www2.ed.gov. I read those through a scraping service that returned markdown. usda.gov/contact-us and the USDA complaint portal also returned 403 to the scraper, so I never read them.
- **studentaid.gov** is a JavaScript app, so it also went through the scraper.
- **eCFR:** the versioner API now requires a compression header. Without `--compressed` it returns 406, "This endpoint requires response compression". The working form was `curl --compressed https://www.ecfr.gov/api/versioner/v1/full/<issue-date>/title-N.xml?part=X`, using each title's latest issue date from `/api/versioner/v1/titles.json`.
- **Shared scratchpad:** other agents write to the same scratchpad at the same time. My first fetches were overwritten by another agent using the same file names, so I redid them in a `parta/` subfolder. Future batches should use their own subfolder from the start.
- **Quote checking:**
  - For pages fetched with curl, and for all eCFR text, a script checked every quote, PM name/email and phone number after whitespace normalization.
  - For pages read through the scraper (FEMA, ED, studentaid, DOL, USDA, AD-3027), I checked by eye against the scraped markdown.
- I did not submit any forms, send any messages, or create any accounts. The DHS CRCL portal and the USDA complaint portal were not read at all; the FSA "Submit Feedback" button was not opened.

## Section 504 "federally conducted" regulations (filing windows)

I confirmed every part on the eCFR. None is assumed.

| Agency | Part | Section | Window | Notes |
|---|---|---|---|---|
| DHS (incl. TSA, USCIS) | 6 CFR part 15 | §15.70(d)(3) | 180 days | Not the DOJ-model ".170" numbering. Covers "all programs or activities conducted by the Department" (§15.2). Complaints go to the Officer for CRCL (§15.70(c)). |
| FEMA | 44 CFR part 16 | §16.170(d) | 180 days | FEMA's own rule. §16.170(c) still names the "Office of Equal Rights, Room 810". The DHS-wide 6 CFR 15.70 also arguably applies, with the same 180 days. |
| ED | 34 CFR part 105 | §105.41(d) | 180 days | Not ".170". §105.41(c) says to send complaints to the Office of Management, FB-6, 400 Maryland Ave SW. |
| DOL | 29 CFR part 33 | §33.12(d) | 180 days | Section titled "Complaint handling procedures". Says "All complaints", not "complete complaints". The "Director" may extend the deadline. |
| USDA | 7 CFR part 15e | §15e.170(d) | 180 days | §15e.170(c) names the "Office of Advocacy and Enterprise", which is outdated. |
| HUD | 24 CFR part 9 | §9.170(d) | 180 days | Complaints go to the Assistant Secretary for FHEO or any HUD Area Office. A mailed complaint counts as filed on its postmark date. |

All six regulations say the agency may extend the deadline for good cause.

## DHS (department entry; folds in TSA), about 3 minutes

- **Routing:**
  - dhs.gov/accessibility (updated 08/07/2026) sends feedback to accessibility@hq.dhs.gov.
  - Its "formal complaint online" link goes to CRCL's "Make a Civil Rights Complaint" page (04/08/2026). That page lists Section 508 ICT complaints within CRCL's jurisdiction.
  - The only current filing method is the online portal at engage.dhs.gov/crcl-complaint. It is a ServiceNow app, and my fetcher saw only a "browser not supported" page.
- **TSA:**
  - TSA's page (Last Update 02/16/2024) explicitly sends formal 508 complaints to the DHS CRCL page.
  - TSA keeps only Accessibility@tsa.dhs.gov, for general inquiries. So TSA is folded into the DHS entry.
- **Lost channels:**
  - An older CRCL page (01/31/2025) still offers a fillable PDF and an email/fax/mail option. The email/fax/mail page now redirects to the portal.
  - CRCLCompliance@hq.dhs.gov and fax 202-401-4708 appear only on third-party sites and a 2013 PDF, so I did not use them.
- **Program manager conflict (TSA):**
  - GSA lists Thomas Lockley, plus a deputy whose name is spelled "Elliot" but whose email is "elliott.hoang".
  - TSA's own page says Matt Byrne.
- **Phone:**
  - The JSON uses the DHS operator line, 202-282-8000.
  - Alternatives: the DHS CX Directorate at 202-447-0440 (shown on the accessibility page), and the TSA Contact Center at (866) 289-9673.
  - A human should pick one.
- **Typo:** the DHS CRCL page says Section 508 was amended by the "Workforce Investment Act of 1988". It means 1998.

## DHS / USCIS (bureau entry), about 1 minute

- **Routing:**
  - USCIS runs its own formal intake. The page heading is "Report accessibility issues or file a formal accessibility complaint", and it says "you may file a 508 complaint by emailing USCIS-SECTION508@uscis.dhs.gov". The page was updated 09/24/2026.
  - The same page also points to CRCL for civil rights complaints.
  - So this is a separate `bureau` entry.
- **Ambiguity:**
  - Nothing says how USCIS processes or decides these complaints.
  - Under 6 CFR 15.70, the decision-maker for Section 504 complaints is DHS CRCL.
  - A human should decide whether "bureau" is right.
- **Not used:** the Section 508 Coordinator's mailing address in Camp Springs, MD is listed under "Contact Information", not as a complaint address. It is in notes only.
- **Program manager:** Kenneth S. Moser, per GSA. The USCIS page names no one.

## DHS / FEMA (bureau entry), about 3 minutes, the messiest

- **Routing:**
  - FEMA's Section 508 Program page (2022) says to "File a Section 508 complaint by contacting the Office of Equal Rights", now the Office of Civil Rights (renamed May 1, 2024), or to call 202-646-3535.
  - FEMA OCR runs its own external complaint process, so this is a `bureau` entry.
- **Conflicts:** five different civil-rights email addresses appear across four FEMA pages:
  - FEMA-OCAO-ICD@
  - FEMA-OCR@
  - FEMA-OCR-ECRD@ (on the External Civil Rights Division page this is the link text, but the link actually opens FEMA-CivilRightsOffice@)
  - FEMA-CivilRights@
  - FEMA-CivilRightsOffice@
- **More conflicts:**
  - Three phone numbers: 202-646-3535, (833) 285-7448 and 202-212-3535.
  - Two mail recipients at the same street address: "Integration and Coordination Division" and "Office of Civil Rights".
  - Feedback inboxes also disagree: FEMAWebTeam@, fema-section508@ and fema-accessibility@.
  - I used the newest step-by-step "Filing a Complaint" page (updated June 16, 2026) for the complaint channels.
- **Oddity:** FEMA cites 45 CFR part 85, the HHS rule, as its Section 504 regulation.
- **Phone:**
  - The JSON uses the FEMA Helpline, 1-800-621-3362, which is for disaster assistance.
  - The general FEMA line is 202-646-2500.
- **Program manager:** Janice Fenlason, per GSA.

## ED (department entry; covers studentaid.gov), about 2 minutes

- **FSA routing:**
  - studentaid.gov has no formal complaint path. Its notices page says "If you have feedback or a concern related to accessibility of any content on this website, please contact us", which links to the general help-center contact page.
  - The old guess URL /help-center/answers/article/accessibility is a 404.
  - So FSA is folded into the department entry.
- **ED statement:** reviewed December 29, 2025. Under the heading "Available complaint processes" it gives only ITAPSupport@ed.gov, worded like a help desk.
  - I marked it `complaint` because ED itself labels it that way. **Needs human review**, because it may really be feedback only.
- **Regulation-only address:** the Office of Management address from 34 CFR 105.41(c) is in notes, not channels.
- **Not used:** ED's Office for Civil Rights. It appears to cover discrimination by schools, and nothing I read sends complaints about ED's own ICT there.
- **Program manager is null:**
  - GSA's ED section is empty (page reviewed August 2026).
  - ED's statement names Denise McGland (denise.mcgland@ed.gov). It is in notes only.
- **Phone:** the FSA main line, 1-800-4FED-AID (1-800-433-3243), TTY 1-800-730-8913, from ed.gov/about/contact-us. ED's contact page lists no general ED help line.

## DOL (department entry), about 2 minutes

- **Routing:**
  - The DOL statement (1/22/2025) uses 508Matters@dol.gov for access problems.
  - For complaints it gives only "contact the Civil Rights Center at (202) 693-6500".
  - CRC's "About" page says its Office of External Enforcement enforces Sections 504 and 508 for programs "conducted by" DOL.
- **Complaint channel:** taken from CRC's "How to File" page: mail to the Director, CRC, Office of External Enforcement, Room N-4123. Fax 202-693-6505 is in notes only.
- **Caveat:** that page is written for complaints against DOL fund recipients. Its instructions are generic and never mention DOL's own ICT.
- **Program manager conflict:**
  - GSA lists Eric W. Wright.
  - DOL's statement names "Brandon Jubar" and is probably stale. The 508Matters quote includes that name.
- **Other conflict:** DOL's Contact Us page also sends "accessibility problems" to webmaster@dol.gov.
- **Phone:** 1-866-4-USA-DOL (1-866-487-2365), Monday to Friday, 8 a.m. to 8 p.m. ET.

## USDA (department entry), about 2 minutes, the cleanest

- **Statement:** updated June 2025. It has an explicit "How to File a Complaint Alleging a Section 508 Violation" section: file within 180 days with OASCR's Center for Civil Rights Enforcement, using the Program Discrimination Complaint process.
- **Feedback:** two inboxes, Section508-ocio@usda.gov and 508accessibilityfeedback@usda.gov. The statement promises an escalation process: confirmation within 1 business day, engagement within 3.
- **Complaint channels:**
  - The OASCR portal. It returned 403 to the scraper, so I never saw it.
  - program.intake@usda.gov.
  - A mail address, Mail Stop 9410, taken from form AD-3027. The form's address line has a stray comma: "1400 Independence, Ave".
- **Regulation conflict:** 7 CFR 15e.170(c) names the obsolete "Office of Advocacy and Enterprise".
- **Phone:**
  - The JSON uses the USDA Information Hotline, (202) 720-2791, from fna.usda.gov.
  - The AskUSDA "1-833-ONE-USDA" display text dials 1-800-663-8732 when clicked, so the two do not match. I did not use it.
- **Program manager:**
  - GSA lists three undesignated Agencywide names.
  - The JSON uses Angela Williams, because USDA's statement names her as the Program Manager.

## HUD (department entry), about 1 minute

- **Routing:**
  - hud.gov/accessibility was last reviewed July 12, 2024.
  - It uses a single inbox, 508@hud.gov, for both feedback and "a complaint about a violation of Section 508 by HUD". I marked it `complaint`.
- **Hidden addresses:** the addresses are hidden by Cloudflare email obfuscation, and I decoded them from the HTML. The "Giavonni Hester" link also points to 508@hud.gov, not a personal address.
- **Regulation only:** 24 CFR 9.170(d) sends formal Section 504 complaints to the Assistant Secretary for FHEO or any HUD Area Office. The page never mentions this. It is in notes only.
- **Phone:**
  - The JSON uses the HUD Customer Service Center, (800) 955-2232, Monday to Friday, 9:00 a.m. to 5:00 p.m. EST. It is listed under resources for HUD-assisted renters, and HUD has no general help line.
  - The footer number "T: (202) 402-3815" has no label.
- **Program manager:** GSA spells the name "GiaVonni Hester"; HUD's page spells it "Giavonni Hester".
- **Typo:** the quote keeps HUD's "identity" (for "identify").

## Cross-cutting issues for the human reviewer

1. **Regulation addresses are stale everywhere.** Four of the six 504 rules name offices that have since been renamed: FEMA "Office of Equal Rights", USDA "Office of Advocacy and Enterprise", DOL "Directorate of Civil Rights", and ED "Office of Management, FB-6". I never used a regulation address as a channel.
2. **Not every rule uses the DOJ-model "§ X.170" numbering.** DHS uses 15.70, ED uses 105.41 and DOL uses 33.12. Do not generate CFR links by pattern.
3. **Some purposes are judgment calls.** Two channels are marked `complaint` mainly because of how the agency labels them: ED's ITAPSupport@ed.gov and USCIS's 508 inbox. HUD's single inbox serves both purposes. The UI may need a "both" value, or should allow the same address to appear once per purpose.
4. **Agency pages and the GSA listing disagree on program managers** for TSA, DOL and ED (GSA has no one for ED). Agency pages tend to be stale: DOL 2025, TSA 2024.
5. **FEMA's contact data is internally inconsistent** enough that it might be worth a note to FEMA OCR, after a human confirms.
