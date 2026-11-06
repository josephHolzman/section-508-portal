import { describe, expect, it } from "vitest";
import { ENTRIES, agencyOptions } from "../src/data/directory";

/** Data checks that run on every build, so a hand edit can't quietly break routing. */
describe("agency directory data", () => {
  it("has unique ids", () => {
    const ids = ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never lists a domain under two agencies", () => {
    const seen = new Map<string, string>();
    for (const e of ENTRIES) {
      for (const d of e.domains) {
        expect(seen.get(d), `${d} is in ${seen.get(d)} and ${e.id}`).toBeUndefined();
        seen.set(d, e.id);
      }
    }
  });

  it.each(ENTRIES.map((e) => [e.id, e] as const))("%s: every fact has a source", (_id, e) => {
    expect(e.statementUrl).toMatch(/^https:\/\//);
    expect(e.sources.length).toBeGreaterThan(0);
    for (const c of e.channels) {
      expect(["complaint", "feedback"]).toContain(c.purpose);
      expect(c.source).toMatch(/^https:\/\//);
      expect(c.address ?? c.url).toBeTruthy();
      if (c.type === "email") expect(c.address).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      if (c.type === "webform" || c.type === "portal") expect(c.url).toMatch(/^https:\/\//);
    }
    if (e.filingWindowDays !== null) expect(e.filingWindowSource).toMatch(/^https:\/\//);
    if (e.phone) expect(e.phone.source).toMatch(/^https:\/\//);
    if (e.pm) expect(e.pm.email).toMatch(/@/);
    if (e.lastChecked !== null) expect(e.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("gives each department one entry in the agency list", () => {
    const names = agencyOptions().map((a) => a.name);
    expect(names.filter((n) => n.startsWith("Department of Homeland Security"))).toHaveLength(1);
    expect(names.filter((n) => n.startsWith("Department of Education"))).toHaveLength(1);
  });
});
