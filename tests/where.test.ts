import { describe, expect, it } from "vitest";
import {
  agencyByKey,
  agencyOptions,
  coverageOf,
  normalizeAgencyName,
  programManagersFor,
  resolveLink,
} from "../src/data/directory";
import { hostFromInput } from "../src/lib/lookup";
import { confirmedAgency, validateAgency } from "../src/steps/agency";
import { validateWhere } from "../src/steps/where";

describe("hostFromInput", () => {
  it.each([
    ["https://www.ssa.gov/apply/retirement", "ssa.gov"],
    ["  WWW.SSA.GOV/apply  ", "ssa.gov"],
    ["ssa.gov:443/x", "ssa.gov"],
    ["secure.ssa.gov", "secure.ssa.gov"],
  ])("reads %s as %s", (input, host) => {
    expect(hostFromInput(input)).toBe(host);
  });

  it.each(["", "not a url", "mailto:help@ssa.gov", "javascript:alert(1)", "http://192.168.0.1/"])(
    "rejects %s",
    (input) => {
      expect(hostFromInput(input)).toBeNull();
    },
  );
});

describe("resolveLink", () => {
  it("prefers a directory entry that lists the domain", () => {
    const r = resolveLink("https://www.irs.gov/forms-instructions");
    expect(r).toMatchObject({ status: "match", host: "irs.gov", agency: { key: "dir:irs" } });
  });

  it("matches subdomains to their parent", () => {
    expect(resolveLink("secure.ssa.gov")).toMatchObject({ status: "match", agency: { key: "dir:ssa" } });
  });

  it("finds federal sites the index lists without an agency", () => {
    expect(resolveLink("https://www.usps.com/")).toMatchObject({ status: "match", agency: { key: "dir:usps" } });
  });

  it("falls back to the index for agencies outside the directory", () => {
    expect(resolveLink("https://www.energy.gov/")).toMatchObject({
      status: "match",
      agency: { key: "idx:Department of Energy" },
    });
  });

  it("reports a miss for state sites without blaming the link", () => {
    expect(resolveLink("https://www.dmv.ca.gov/")).toEqual({ status: "no-match", host: "dmv.ca.gov" });
  });

  it("recognizes text that isn't a link", () => {
    expect(resolveLink("the benefits page")).toEqual({ status: "not-a-link" });
  });
});

describe("agencyOptions", () => {
  it("lists each agency once, sorted, without the registrar placeholder", () => {
    const names = agencyOptions().map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    expect(names).not.toContain(".gov Administration");
    expect(names.filter((n) => n.startsWith("Social Security Administration"))).toEqual([
      "Social Security Administration",
    ]);
    expect(names.filter((n) => /^(U\.S\.|United States) Postal Service/.test(n))).toEqual(["U.S. Postal Service"]);
  });
});

describe("validateWhere", () => {
  it("requires a choice", () => {
    expect(validateWhere({}).map((e) => e.message)).toEqual(["Choose what you had trouble with"]);
  });
  it("requires a link for a website", () => {
    expect(validateWhere({ kind: "link", url: " " }).map((e) => e.targetId)).toEqual(["link"]);
  });
  it("explains what a link looks like", () => {
    expect(validateWhere({ kind: "link", url: "benefits page" })[0]?.message).toMatch(/like www\.ssa\.gov\/apply/);
  });
  it("needs no link for an app", () => {
    expect(validateWhere({ kind: "app" })).toEqual([]);
  });
});

describe("validateAgency and confirmedAgency", () => {
  const matched = { kind: "link" as const, url: "ssa.gov", host: "ssa.gov", match: "match" as const, matchedKey: "dir:ssa" };

  it("asks the person to confirm a match", () => {
    expect(validateAgency(matched).map((e) => e.targetId)).toEqual(["confirm-yes"]);
    expect(confirmedAgency({ ...matched, confirm: "yes" })?.key).toBe("dir:ssa");
  });

  it("requires a pick when the match is wrong", () => {
    expect(validateAgency({ ...matched, confirm: "other" }).map((e) => e.targetId)).toEqual(["agency-select"]);
    expect(confirmedAgency({ ...matched, confirm: "other", chosenKey: "dir:va" })?.key).toBe("dir:va");
  });

  it("sends a state or local site to the exit", () => {
    expect(validateAgency({ ...matched, confirm: "state-local" })).toEqual([]);
    expect(confirmedAgency({ ...matched, confirm: "state-local" })).toBeNull();
  });

  it("lets an app or document go straight to the list", () => {
    expect(validateAgency({ kind: "app" }).map((e) => e.targetId)).toEqual(["agency-select"]);
    expect(confirmedAgency({ kind: "document", chosenKey: "dir:state" })?.name).toBe("Department of State");
  });

  it("ignores a stale state-local answer when picking from the list", () => {
    expect(confirmedAgency({ kind: "app", confirm: "state-local", chosenKey: "dir:va" })?.key).toBe("dir:va");
  });

  it("finds directory and index agencies by key", () => {
    expect(agencyByKey("dir:irs")?.name).toBe("Internal Revenue Service (Department of the Treasury)");
    expect(agencyByKey("idx:Department of Energy")?.entryId).toBeUndefined();
  });
});

describe("program managers and coverage", () => {
  it("matches GSA's listing despite naming differences", () => {
    expect(normalizeAgencyName("Department of Agriculture (USDA)")).toBe(normalizeAgencyName("Department of Agriculture"));
    expect(normalizeAgencyName("United States Access Board")).toBe(normalizeAgencyName("Access Board"));
    expect(programManagersFor(agencyByKey("idx:Environmental Protection Agency")!).length).toBeGreaterThan(0);
    expect(programManagersFor(agencyByKey("idx:Department of Defense")!).length).toBeGreaterThan(0);
  });

  it("flags offices Section 508 doesn't cover", () => {
    expect(coverageOf(agencyByKey("idx:United States Senate")!)).toBe("not-covered");
    expect(coverageOf(agencyByKey("idx:Federal Election Commission")!)).toBe("not-covered");
    expect(coverageOf(agencyByKey("dir:ssa")!)).toBe("covered");
  });
});
