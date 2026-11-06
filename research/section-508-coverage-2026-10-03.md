# Which federal sites does Section 508 cover? (2026-10-03)

Research note for Barrier Report. It classifies the agency names in `data/domains.json` (taken from GSA's Federal Website Index) by whether Section 508 applies to them. The machine-readable result is in `data/coverage.json`. This is not legal advice. Every quote below comes from a page opened on 2026-10-03.

## Summary

- **Statute.** 29 U.S.C. 794d binds "each Federal department or agency, including the United States Postal Service." The statute itself does not define "agency."
- **Standards.** The Access Board's Revised 508 Standards define "Agency" by reference to 44 U.S.C. 3502, plus USPS.
- **What 3502(1) covers and excludes.** It is limited to the executive branch, including the Executive Office of the President, plus independent regulatory agencies. It **expressly excludes GAO and the Federal Election Commission**, DC and territorial governments, and government-owned contractor-operated facilities.
- **Legislative branch.** Not covered. The Office of Compliance (now the Office of Congressional Workplace Rights, OCWR) says so directly. GAO, GPO, the Library of Congress and the House follow 508 voluntarily.
- **Judicial branch.** No source found applies 508 to the courts by law, and they fall outside 3502(1). Some courts, such as the Second Circuit, commit to 508 voluntarily.
- **Index result (145 names).** 107 covered, **24 not covered**, **14 unclear**.

## (a) Statutory and regulatory text

### 29 U.S.C. 794d(a)(1)(A)
Source: https://www.law.cornell.edu/uscode/text/29/794d

> "When developing, procuring, maintaining, or using electronic and information technology, each Federal department or agency, including the United States Postal Service, shall ensure, unless an undue burden would be imposed on the department or agency, that the electronic and information technology allows, regardless of the type of medium of the technology—"

Other parts of 794d:
- (a)(5) exempts national security systems.
- (f)(2) requires complaints to "be filed with the Federal department or agency alleged to be in noncompliance."
- 794d contains no definition of "Federal department or agency."

(uscode.house.gov redirected our requests to house.gov, so Cornell LII was used for every U.S. Code citation.)

### 36 CFR part 1194, Appendix A, E103.4 "Agency"
Sources: https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-36?part=1194 (eCFR, Appendix A) and https://www.access-board.gov/ict/

> "Agency. Any agency or department of the United States as defined in 44 U.S.C. 3502, and the United States Postal Service."

The same definition appears in the 2017 final rule, 82 FR 5790: https://www.govinfo.gov/content/pkg/FR-2017-01-18/html/2017-00395.htm

Under E101.1, compliance "is mandatory for Federal agencies subject to Section 508 of the Rehabilitation Act of 1973, as amended (29 U.S.C. 794d)."

For comparison, the original 2000 standards (old 36 CFR 1194.4, now republished as Appendix D) used: "Agency. Any Federal department or agency, including the United States Postal Service." Sources: eCFR page above, and 65 FR 80500 at https://www.govinfo.gov/content/pkg/FR-2000-12-21/html/00-32017.htm

### 44 U.S.C. 3502(1), verbatim
Source: https://www.law.cornell.edu/uscode/text/44/3502

> (1) the term "agency" means any executive department, military department, Government corporation, Government controlled corporation, or other establishment in the executive branch of the Government (including the Executive Office of the President), or any independent regulatory agency, but does not include—
> (A) the Government Accountability Office;
> (B) Federal Election Commission;
> (C) the governments of the District of Columbia and of the territories and possessions of the United States, and their various subdivisions; or
> (D) Government-owned contractor-operated facilities, including laboratories engaged in national defense research and production activities;

44 U.S.C. 3502(5) defines "independent regulatory agency." It lists the Board of Governors of the Federal Reserve System, CFTC, CPSC, FCC, FDIC, FERC, FHFA, FMC, FTC, the Interstate Commerce Commission, the "Mine Enforcement Safety and Health Review Commission", NLRB, NRC, OSHRC, PRC, SEC, the Bureau of Consumer Financial Protection, the Office of Financial Research, and OCC, "and any other similar agency designated by statute as a Federal independent regulatory agency or commission." (Same URL.)

**The FEC is a special case.** 3502(1)(B) excludes the FEC, so the FEC falls outside the Revised 508 Standards' "Agency" definition. However, GSA's program manager listing shows an FEC Section 508 PM and an FEC 508 coordinator mailbox (https://www.section508.gov/tools/program-manager-listing/). The FEC is therefore `notCovered` in the data but runs a 508 program in practice. Barrier Report should still route FEC complaints to that contact, with a caveat.

## (b) Legislative and judicial branches

### Legislative branch: not covered
- **OCWR Section 102(b) Interim Report (Nov 2001)**, https://www.ocwr.gov/?p=1858 (PDF: https://www.ocwr.gov/wp-content/uploads/2021/09/report_section_102_b_interim_electronic_information_systems.pdf). It describes 508 as requiring "that Executive Branch agencies provide their disabled employees and disabled members of the public with access" and states: "Section 508 does not apply to the employing offices covered by the CAA, or to the Congressional instrumentalities GAO, GPO, or Library of Congress."
- **Who the CAA covers.** CAA "covered employees" are employees of the House, the Senate, the Office of Congressional Accessibility Services, the Capitol Police, CBO, the Office of the Architect of the Capitol, the Office of the Attending Physician, OCWR, the Office of Technology Assessment, the Library of Congress, and the John C. Stennis Center (2 U.S.C. 1301(3)): https://www.law.cornell.edu/uscode/text/2/1301
- **ADA instead of 508.** The legislative branch's accessibility obligations come through the Congressional Accountability Act (ADA titles II and III via OCWR), not Section 508. This is inferred from OCWR's role as described on the same page; ADA routing was not researched further.
- **Voluntary adoption:**
  - GAO: "We strive to make GAO's public website accessible to people with disabilities per Section 508 of the Rehabilitation Act (as amended)." Report problems to contact@gao.gov. https://www.gao.gov/accessibility (curl returned 403; read via a fetch tool.)
  - GPO: its accessibility page describes 508 and says "GPO has always had a commitment to accessibility." https://www.gpo.gov/accessibility
  - Library of Congress: "We believe that our web site is compliant with Section 508 and W3C accessibility design guidelines." Contact ada@loc.gov. https://www.loc.gov/accessibility/accessibility-for-visitors/web-site-accessibility/
  - House: "this site has been designed to conform with: Technical Standards for Web-based Intranet and Internet Information and Applications (36 C.F.R. part 1194) ... pursuant to section 508". https://www.house.gov/accessibility
  - The Senate (senate.gov/general/accessibility.htm returned "file not found"), CBO and the Smithsonian (both 403) could not be read.

### Judicial branch: not covered by 3502(1) (no authoritative statement found)
- 3502(1) reaches only the executive branch and independent regulatory agencies. The judicial-branch entities in the index are placed in the judicial branch by statute:
  - FJC, "established within the judicial branch": https://www.law.cornell.edu/uscode/text/28/620
  - USSC, "an independent commission in the judicial branch": https://www.law.cornell.edu/uscode/text/28/991
  - AO, Director appointed by the Chief Justice: https://www.law.cornell.edu/uscode/text/28/601
- The U.S. Tax Court "is not an agency of, and shall be independent of, the executive branch of the Government" (26 U.S.C. 7441): https://www.law.cornell.edu/uscode/text/26/7441
- **Voluntary adoption:** the Second Circuit says: "To meet this commitment, we will comply with the requirements of Section 508 of the Rehabilitation Act." https://coop.ca2.uscourts.gov/nav/accessibility.html
- **Gap:** no Access Board, section508.gov or Judicial Conference page was found that states the judiciary's 508 status outright. A 2001 trade-press article returned by search claimed 508 covers "the executive and judicial branches." It was not opened as an authoritative source and is not relied on.

### General statements of scope
- section508.gov: "The law 29 U.S.C § 794d applies to all federal agencies when they develop, procure, maintain, or use electronic and information technology." https://www.section508.gov/manage/laws-and-policies/
- Access Board: "The law applies to all Federal agencies when they develop, procure, maintain, or use electronic and information technology." https://www.access-board.gov/about/law/ra.html

### Entities that statutes say are not federal agencies
- Legal Services Corporation: "the Corporation shall not be considered a department, agency, or instrumentality, of the Federal Government" (42 U.S.C. 2996d(e)(1)). https://www.law.cornell.edu/uscode/text/42/2996d
- State Justice Institute: "a private nonprofit corporation" (42 U.S.C. 10702), and "the Institute shall not be considered a department, agency, or instrumentality of the Federal Government" (42 U.S.C. 10704). https://www.law.cornell.edu/uscode/text/42/10702 and https://www.law.cornell.edu/uscode/text/42/10704
- Amtrak "is not a department, agency, or instrumentality of the United States Government" (49 U.S.C. 24301(a)(3)). https://www.law.cornell.edu/uscode/text/49/24301
  - Its OIG is marked **unclear**: the OIG is a statutory inspector general inside a non-agency, and that question was not resolved.

### Other statutes relied on
| Entity | Statutory status | Source |
|---|---|---|
| CBO | "an office of the Congress" | https://www.law.cornell.edu/uscode/text/2/601 |
| OCWR | "independent office within the legislative branch" | https://www.law.cornell.edu/uscode/text/2/1381 |
| Stennis Center | "established in the legislative branch" | https://www.law.cornell.edu/uscode/text/2/1103 |
| Open World Leadership Center | renamed Congressional Office for International Leadership (Pub. L. 117-103); originally "established in the legislative branch" | https://www.law.cornell.edu/uscode/text/2/1151 |
| MedPAC | "established as an agency of Congress" | https://www.law.cornell.edu/uscode/text/42/1395b-6 |
| MACPAC | statute names no branch; MACPAC says it is "a non-partisan legislative branch agency" | https://www.law.cornell.edu/uscode/text/42/1396 and https://www.macpac.gov/about-macpac/ |
| US-China Commission | "a legislative branch commission" | https://www.uscc.gov/about-us |
| USHMM | "independent establishment of the United States Government" (no branch named) | https://www.law.cornell.edu/uscode/text/36/2301 |
| USIP | "independent nonprofit corporation" | https://www.law.cornell.edu/uscode/text/22/4603 |
| Smithsonian | the President, Vice President, Chief Justice and executive department heads "are constituted an establishment" | https://www.law.cornell.edu/uscode/text/20/41 |
| USCIRF | members appointed by the President and congressional leaders; no branch named in the text reviewed | https://www.law.cornell.edu/uscode/text/22/6431 |
| ARC | most staff "are not federal employees for any purpose" | https://www.law.cornell.edu/uscode/text/40/14301 |
| SCRC / SBRC / NBRC | same statute; "No Federal Employee Status" for most staff | https://www.law.cornell.edu/uscode/text/40/15301 |
| Armed Forces Retirement Home | "independent establishment in the executive branch" | https://www.law.cornell.edu/uscode/text/24/411 |
| CIGIE | "independent entity within the executive branch" | https://www.law.cornell.edu/uscode/text/5/424 |
| Truman Foundation | "independent establishment of the executive branch" | https://www.law.cornell.edu/uscode/text/20/2004 |
| Madison Foundation | "independent establishment of the executive branch" | https://www.law.cornell.edu/uscode/text/20/4502 |

## (c) Classification of every agency name in data/domains.json

How each label was assigned:
- **covered:** an executive department, executive establishment, government corporation or independent regulatory agency. Most also appear on GSA's 508 PM listing (`data/program-managers.json`).
- **covered, marked "lower confidence":** classed as executive by structure, but no branch-specific statute was checked. Verify these before stating coverage publicly.
- **not covered:** legislative branch, judicial branch, excluded by 3502(1), or declared by statute not to be a federal agency.
- **unclear:** hybrid or unverified status.

| Agency name (exact, from domains.json) | Classification | Reasoning |
|---|---|---|
| .gov Administration | unclear | Not an agency name. Its domains (dotgov.gov, nic.gov, example.gov, etc.) look like .gov registry infrastructure; the operator was not verified. |
| Access Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Adams Memorial Commission | unclear | Commemorative commission; branch status not verified. |
| Administrative Conference of the United States | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Administrative Office of the United States Courts | not covered | Judicial branch; its Director is appointed by the Chief Justice (28 U.S.C. 601). Outside 3502(1)'s executive-branch scope. |
| Advisory Council on Historic Preservation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| American Battle Monuments Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Appalachian Regional Commission | unclear | Federal-state commission; most staff 'are not federal employees for any purpose' (40 U.S.C. 14301). Not on GSA's 508 PM listing. |
| Appraisal Subcommittee of the Federal Financial Institutions Examination Council | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Architect of the Capitol | not covered | Legislative branch; its employees are CAA 'covered employees' (2 U.S.C. 1301(3)(F)); OCWR says 508 does not apply to CAA employing offices. |
| Architect of the Capitol, Office of Inspector General | not covered | Part of the Architect of the Capitol (legislative branch); same reasoning. |
| Arctic Research Commission | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Armed Forces Retirement Home | covered | 'Independent establishment in the executive branch' (24 U.S.C. 411(a)). |
| Barry Goldwater Scholarship and Excellence in Education Foundation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Board of Governors of the Federal Reserve | covered | Independent regulatory agency, 3502(5). |
| Capitol Police | not covered | Legislative branch; CAA covered employing office (2 U.S.C. 1301(3)(D)). |
| Central Intelligence Agency | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Chemical Safety and Hazard Investigation Board | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Civil Rights Cold Case Records Review Board | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Commodity Futures Trading Commission | covered | 3502(5). |
| Congressional Budget Office | not covered | 'An office of the Congress' (2 U.S.C. 601(a)); CAA covered (2 U.S.C. 1301(3)(E)). |
| Consumer Financial Protection Bureau | covered | 3502(5) ('Bureau of Consumer Financial Protection'). |
| Consumer Product Safety Commission | covered | 3502(5). |
| Corporation for National and Community Service | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Council of the Inspectors General on Integrity and Efficiency | covered | 'Independent entity within the executive branch' (5 U.S.C. 424(a)). |
| Court Services and Offender Supervision Agency for the District of Columbia | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Defense Nuclear Facilities Safety Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Delta Regional Authority | unclear | Federal-state regional authority; status not verified; not on GSA's 508 PM listing. |
| Denali Commission | unclear | Federal-state commission; status not verified; not on GSA's 508 PM listing. |
| Department of Agriculture | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Commerce | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Defense | covered | Executive department; GSA lists it as 'Department of War (DOW)'. |
| Department of Education | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Energy | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Health and Human Services | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Homeland Security | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Housing and Urban Development | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Justice | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Labor | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of State | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of the Interior | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of the Treasury | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Transportation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Department of Veterans Affairs | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Election Assistance Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Environmental Protection Agency | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Equal Employment Opportunity Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Executive Office of the President | covered | Expressly included in 3502(1). |
| Export-Import Bank of the United States | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Farm Credit Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Farm Credit System Insurance Corporation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Federal Communications Commission | covered | 3502(5). |
| Federal Deposit Insurance Corporation | covered | 3502(5). |
| Federal Election Commission | not covered | Expressly excluded from 'agency' by 44 U.S.C. 3502(1)(B), so outside the E103.4 definition. FLAG: FEC still lists a 508 PM and a 508 coordinator mailbox on GSA's listing, so it does run a 508 program in practice. |
| Federal Energy Regulatory Commission | covered | 3502(5). |
| Federal Housing Finance Agency | covered | 3502(5). |
| Federal Judicial Center | not covered | 'Established within the judicial branch' (28 U.S.C. 620(a)). |
| Federal Labor Relations Authority | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Federal Maritime Commission | covered | 3502(5). |
| Federal Mediation and Conciliation Service | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Federal Mine Safety and Health Review Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Federal Permitting Improvement Council | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Federal Retirement Thrift Investment Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Federal Trade Commission | covered | 3502(5). |
| General Services Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Government Accountability Office | not covered | Expressly excluded by 44 U.S.C. 3502(1)(A); legislative instrumentality per OCWR. Voluntarily follows 508 (gao.gov/accessibility). |
| Government Publishing Office | not covered | Legislative instrumentality not covered per OCWR; gpo.gov says it pursues 508 compliance voluntarily. |
| Gulf Coast Ecosystem Restoration Council | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Harry S Truman Scholarship Foundation | covered | 'Independent establishment of the executive branch' (20 U.S.C. 2004(a)). |
| Institute of Museum and Library Services | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Inter-American Foundation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| International Trade Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| James Madison Memorial Fellowship Foundation | covered | 'Independent establishment of the executive branch' (20 U.S.C. 4502(a)). |
| Japan-United States Friendship Commission | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Legal Services Corporation | not covered | 'Shall not be considered a department, agency, or instrumentality, of the Federal Government' (42 U.S.C. 2996d(e)(1)). |
| Library of Congress | not covered | Legislative instrumentality not covered per OCWR; loc.gov says its site aims to comply with 508. |
| Marine Mammal Commission | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Medicaid and CHIP Payment and Access Commission | not covered | Calls itself 'a non-partisan legislative branch agency' (macpac.gov/about-macpac). The statute (42 U.S.C. 1396) does not name a branch. |
| Medicare Payment Advisory Commission | not covered | 'Established as an agency of Congress' (42 U.S.C. 1395b-6(a)). |
| Merit Systems Protection Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Millennium Challenge Corporation | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Morris K. Udall and Stewart L. Udall Foundation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Aeronautics and Space Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Archives and Records Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Capital Planning Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Council on Disability | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| National Credit Union Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Endowment for the Arts | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Endowment for the Humanities | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Gallery of Art | unclear | Independent trust-type institution; branch status not verified (nga.gov returned 403). |
| National Labor Relations Board | covered | 3502(5). |
| National Mediation Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Railroad Passenger Corporation, Office of Inspector General | unclear | Amtrak 'is not a department, agency, or instrumentality of the United States Government' (49 U.S.C. 24301(a)(3)). Whether its statutory OIG is covered was not resolved. |
| National Science Foundation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| National Transportation Safety Board | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Northern Border Regional Commission | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Nuclear Regulatory Commission | covered | 3502(5). |
| Occupational Safety and Health Review Commission | covered | 3502(5). |
| Office of Congressional Workplace Rights | not covered | 'Independent office within the legislative branch' (2 U.S.C. 1381(a)). |
| Office of Government Ethics | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Office of Personnel Management | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Office of Special Counsel | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Office of the Director of National Intelligence | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Open World Leadership Center | not covered | Now the Congressional Office for International Leadership, 'established in the legislative branch' (2 U.S.C. 1151, renamed by Pub. L. 117-103). |
| Peace Corps | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Pension Benefit Guaranty Corporation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Postal Regulatory Commission | covered | 3502(5). |
| Presidio Trust | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Privacy and Civil Liberties Oversight Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Public Buildings Reform Board | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| Railroad Retirement Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Securities and Exchange Commission | covered | 3502(5). |
| Selective Service System | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Small Business Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Smithsonian Institution | unclear | A trust 'establishment' whose members are officials from all three branches (20 U.S.C. 41). Its branch status is not settled in what was reviewed. |
| Social Security Administration | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Social Security Advisory Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Southeast Crescent Regional Commission | unclear | Created by the same statute as NBRC (40 U.S.C. 15301), which has no federal-employee status for most staff (15301(e)). NBRC does list a 508 PM with GSA, so this is likely covered but unconfirmed. |
| Southwest Border Regional Commission | unclear | Same as Southeast Crescent: 40 U.S.C. 15301 commission; likely covered by analogy with NBRC, but unconfirmed. |
| State Justice Institute | not covered | Private nonprofit corporation (42 U.S.C. 10702(a)); 'shall not be considered a department, agency, or instrumentality of the Federal Government' (42 U.S.C. 10704). |
| Stennis Center for Public Service | not covered | 'Established in the legislative branch' (2 U.S.C. 1103(a)); CAA covered (2 U.S.C. 1301(3)(K)). |
| Supreme Court of the United States | not covered | Judicial branch; outside 3502(1)'s executive-branch scope. |
| Surface Transportation Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Tennessee Valley Authority | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| Trade And Development Agency | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| U.S. Capitol Police, Office of the Inspector General | not covered | Part of the Capitol Police (legislative branch). |
| U.S. Commission for the Preservation of Americas Heritage Abroad | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| U.S. Commission of Fine Arts | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| U.S. Commission on Civil Rights | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| U.S. Commission on International Religious Freedom | unclear | Members are appointed by the President and congressional leaders (22 U.S.C. 6431); the statute reviewed names no branch. |
| U.S. Interagency Council on Homelessness | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| U.S. Nuclear Waste Technical Review Board | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| U.S. Semiquincentennial Commission | unclear | Congressionally created commemorative commission; branch status not verified. |
| U.S.-China Economic and Security Review Commission | not covered | Calls itself 'a legislative branch commission' (uscc.gov/about-us). |
| United States AbilityOne Commission | covered | Executive establishment; GSA lists it as 'Committee for Purchase from People Who Are Blind or Severely Disabled (CPPBSD)'. |
| United States African Development Foundation | covered | Executive-branch independent agency or government corporation by structure. Not on GSA's PM listing; branch statute not checked (lower confidence). |
| United States Agency for Global Media | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| United States Holocaust Memorial Museum | unclear | 'Independent establishment of the United States Government' (36 U.S.C. 2301); the statute names no branch. |
| United States House of Representatives | not covered | Legislative branch (CAA, 2 U.S.C. 1301(3)(A)); house.gov says it is designed to conform with 36 CFR 1194. |
| United States Institute of Peace | unclear | 'Independent nonprofit corporation' (22 U.S.C. 4603(b)); its status as an executive agency is not clear from the statute. |
| United States International Development Finance Corporation | covered | Executive-branch entity; listed on GSA's 508 PM listing. |
| United States Postal Service | covered | Named in 794d(a)(1)(A) and E103.4. |
| United States Senate | not covered | Legislative branch (CAA, 2 U.S.C. 1301(3)(B)). |
| United States Sentencing Commission | not covered | 'Independent commission in the judicial branch' (28 U.S.C. 991(a)). |
| United States Tax Court | not covered | Article I court; 'not an agency of, and shall be independent of, the executive branch' (26 U.S.C. 7441). |
## Caveats for the product
- **Voluntary adoption does not create a 508 complaint right.** For not-covered entities that follow 508 voluntarily (GAO, GPO, LOC, the House, some courts), Barrier Report can still point users to the entity's own accessibility contact. The tool should not describe that as a Section 508 complaint under 794d(f).
- **Regional commissions.** Northern Border Regional Commission is on GSA's PM listing and is treated as covered. Its sister commissions under 40 U.S.C. 15301 (SCRC, SBRC) are unclear only because no source was found for them.
- **Department of Defense.** The index uses "Department of Defense"; GSA's listing uses "Department of War (DOW)".
- **Covered names in this table were not each individually verified.** The 16 rows marked "lower confidence" in particular should be verified before publishing a coverage statement.
