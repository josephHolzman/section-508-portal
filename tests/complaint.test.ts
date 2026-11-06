import { describe, expect, it } from "vitest";
import { buildComplaint, complaintSubject, formatDate, wcagReferences } from "../src/lib/complaint";
import { daysSinceIncident, needsSignature, planSend } from "../src/lib/routing";
import { emptyWhatHappened, emptyWhatYouNeed, type Answers } from "../src/lib/state";

const full: Answers = {
  version: 1,
  where: {
    kind: "link",
    url: "https://www.ssa.gov/apply/retirement",
    host: "ssa.gov",
    agencyKey: "dir:ssa",
    agencyName: "Social Security Administration",
    agencyId: "ssa",
  },
  whatHappened: {
    ...emptyWhatHappened(),
    task: "Apply for retirement benefits.",
    barriers: ["keyboard", "time"],
    details: 'The "Continue" button can\'t be reached with Tab.',
    date: { month: "10", day: "1", year: "2026" },
    page: "https://www.ssa.gov/apply/retirement",
  },
  whatYouNeed: {
    ...emptyWhatYouNeed(),
    outcomes: ["fix", "another-way", "reply-in-writing"],
    hasDeadline: "yes",
    deadline: { month: "11", day: "15", year: "2026" },
    tech: ["screen-reader"],
    techDetails: "NVDA with Firefox on Windows",
    name: "Jane Doe",
    email: "jane@example.com",
  },
};

describe("formatDate", () => {
  it.each([
    [{ month: "10", day: "01", year: "2026" }, "October 1, 2026"],
    [{ month: "10", day: "", year: "2026" }, "October 2026"],
    [{ month: "", day: "", year: "2026" }, "2026"],
    [{ month: "", day: "", year: "" }, ""],
  ])("formats %o", (date, text) => {
    expect(formatDate(date)).toBe(text);
  });
});

describe("buildComplaint", () => {
  const text = buildComplaint(full, { recipient: "Social Security Administration" }, true);

  it("writes a first-person complaint from the answers", () => {
    expect(text).toBe(`Subject: Accessibility complaint (Section 508): apply for retirement benefits on ssa.gov

To the Social Security Administration:

I am filing a complaint under Section 508 of the Rehabilitation Act about an accessibility barrier on ssa.gov.

What I was trying to do:
Apply for retirement benefits.

What got in the way:
- I couldn't reach or use something with my keyboard.
- Time ran out before I could finish.

In my own words:
The "Continue" button can't be reached with Tab.

When and where:
October 1, 2026, at https://www.ssa.gov/apply/retirement

How I use technology:
I use a screen reader. NVDA with Firefox on Windows.

What I am asking for:
- Fix the barrier.
- Help me finish this task another way before November 15, 2026.
- Reply to me in writing.

How to reach me:
Jane Doe
jane@example.com

Thank you,
Jane Doe

For your accessibility team (possibly related WCAG 2.0 criteria):
2.1.1 Keyboard; 2.1.2 No Keyboard Trap; 2.4.3 Focus Order; 2.4.7 Focus Visible; 2.2.1 Timing Adjustable
`);
  });

  it("never names the tool", () => {
    expect(text).not.toMatch(/barrier report/i);
  });

  it("leaves out the technical appendix when asked", () => {
    expect(buildComplaint(full, { recipient: "x" }, false)).not.toContain("WCAG");
  });

  it("omits sections the person left blank", () => {
    const sparse: Answers = {
      version: 1,
      where: { kind: "app", agencyName: "Department of Energy" },
      whatHappened: { ...emptyWhatHappened(), task: "Check my claim", barriers: ["other"], somethingElse: "a map", page: "" },
      whatYouNeed: { ...emptyWhatYouNeed(), outcomes: ["fix"], name: "Sam", phone: "555-0100" },
    };
    const t = buildComplaint(sparse, { recipient: "Department of Energy" }, true);
    expect(t).toContain("in your mobile app.");
    expect(t).toContain("- A map.");
    expect(t).not.toContain("In my own words");
    expect(t).not.toContain("When");
    expect(t).not.toContain("How I use technology");
    expect(t).not.toContain("For your accessibility team");
    expect(t).toContain("How to reach me:\nSam\n555-0100");
  });

  it("names the office that runs the site when the complaint goes to its department", () => {
    const t = buildComplaint(
      { ...full, where: { ...full.where, host: "irs.gov" } },
      { recipient: "Department of the Treasury", owner: "Internal Revenue Service" },
      false,
    );
    expect(t).toContain("To the Department of the Treasury:");
    expect(t).toContain("on irs.gov run by the Internal Revenue Service.");
  });

  it("states a deadline even when 'another way' wasn't chosen", () => {
    const t = buildComplaint(
      { ...full, whatYouNeed: { ...full.whatYouNeed!, outcomes: ["fix"] } },
      { recipient: "x" },
      false,
    );
    expect(t).toContain("- Fix the barrier.\n- I need this resolved by November 15, 2026.");
  });
});

describe("complaintSubject", () => {
  it("drops a long task and keeps the site", () => {
    const answers = { ...full, whatHappened: { ...full.whatHappened!, task: "x".repeat(80) } };
    expect(complaintSubject(answers)).toBe("Accessibility complaint (Section 508): ssa.gov");
  });
});

describe("wcagReferences", () => {
  it("deduplicates criteria shared by several barriers", () => {
    const answers = { ...full, whatHappened: { ...full.whatHappened!, barriers: ["keyboard", "voice-switch"] } } as Answers;
    expect(wcagReferences(answers)).toEqual([
      "2.1.1 Keyboard",
      "2.1.2 No Keyboard Trap",
      "2.4.3 Focus Order",
      "2.4.7 Focus Visible",
      "4.1.2 Name, Role, Value",
    ]);
  });
});

describe("planSend", () => {
  it("routes an unverified directory agency to its program manager only", () => {
    const plan = planSend(full, new Date(2026, 9, 14));
    expect(plan.verified).toBe(false);
    expect(plan.complaintChannels).toEqual([]);
    expect(plan.programManagers.length).toBeGreaterThan(0);
    expect(plan.context).toEqual({ recipient: "Social Security Administration" });
  });

  it("names CMS without repeating its department", () => {
    const plan = planSend({ ...full, where: { ...full.where, agencyKey: "dir:hhs-cms", agencyId: "hhs-cms" } }, new Date());
    expect(plan.context).toEqual({
      recipient: "Department of Health and Human Services",
      owner: "Centers for Medicare & Medicaid Services",
    });
  });

  it("addresses IRS complaints to Treasury", () => {
    const plan = planSend({ ...full, where: { ...full.where, agencyKey: "dir:irs", agencyId: "irs" } }, new Date());
    expect(plan.context).toEqual({ recipient: "Department of the Treasury", owner: "Internal Revenue Service" });
  });

  it("knows which mailed complaints must be signed", () => {
    expect(needsSignature({ type: "mail", address: "x", url: null, instructionsQuote: "send us a signed letter", source: "" })).toBe(true);
    expect(needsSignature({ type: "email", address: "x", url: null, instructionsQuote: "Email us", source: "" })).toBe(false);
  });
});

describe("daysSinceIncident", () => {
  it("counts only a full date", () => {
    expect(daysSinceIncident(full, new Date(2026, 9, 14))).toBe(13);
    expect(
      daysSinceIncident({ ...full, whatHappened: { ...full.whatHappened!, date: { month: "10", day: "", year: "2026" } } }, new Date()),
    ).toBeNull();
  });
});
