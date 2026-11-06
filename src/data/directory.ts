/**
 * The agency directory: who takes Section 508 complaints, and how.
 *
 * Entries come from data/agencies*.json (hand-verified, CC0). An entry counts
 * as verified only once a person has checked it (`lastChecked` set). Until
 * then the tool treats the agency as unverified and routes to its Section 508
 * program manager, unless VITE_DRAFT_DIRECTORY=verified is set for local
 * testing, which shows a "draft data" warning wherever the data is used.
 */

import domainsJson from "../../data/domains.json";
import overridesJson from "../../data/domain-overrides.json";
import { hostAndParents, hostFromInput, lookupAgency, type DomainIndex } from "../lib/lookup";

export interface Channel {
  type: "email" | "webform" | "mail" | "portal";
  purpose?: "complaint" | "feedback";
  address: string | null;
  url: string | null;
  instructionsQuote: string | null;
  source: string;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  routingLevel: "department" | "bureau";
  parent: string | null;
  domains: string[];
  statementUrl: string;
  channels: Channel[];
  filingWindowDays: number | null;
  filingWindowSource: string | null;
  phone: { number: string; label: string; source: string } | null;
  pm: { name: string; email: string; source: string } | null;
  lastChecked: string | null;
  checkedBy: string | null;
  status: string;
  sources: string[];
}

interface DirectoryFile {
  agencies: DirectoryEntry[];
}

interface ProgramManagerFile {
  agencies: {
    name: string;
    component: string | null;
    managers: { name: string; email: string | null; phone: string | null }[];
  }[];
}

interface CoverageFile {
  notCovered: string[];
  unclear: string[];
}

const directoryFiles = import.meta.glob<DirectoryFile>("../../data/agencies*.json", { eager: true, import: "default" });
const pmFiles = import.meta.glob<ProgramManagerFile>("../../data/program-managers.json", { eager: true, import: "default" });
const coverageFiles = import.meta.glob<CoverageFile>("../../data/coverage.json", { eager: true, import: "default" });

const index = domainsJson as unknown as DomainIndex;
const overrides = (overridesJson as { hosts: Record<string, { agency: string; bureau: string }> }).hosts;

/** Later files win, so a verified agencies.json replaces its draft entry. */
export const ENTRIES: DirectoryEntry[] = (() => {
  const byId = new Map<string, DirectoryEntry>();
  const draftsFirst = Object.keys(directoryFiles).sort(
    (a, b) => Number(b.includes("draft")) - Number(a.includes("draft")) || a.localeCompare(b),
  );
  for (const path of draftsFirst) {
    for (const entry of directoryFiles[path]?.agencies ?? []) {
      // A program manager with no email is no contact at all.
      byId.set(entry.id, entry.pm?.email ? entry : { ...entry, pm: null });
    }
  }
  return [...byId.values()];
})();

export const USING_DRAFTS_AS_VERIFIED = import.meta.env.VITE_DRAFT_DIRECTORY === "verified";

export function isVerified(entry: DirectoryEntry): boolean {
  return entry.lastChecked !== null || USING_DRAFTS_AS_VERIFIED;
}

/** Index owners that aren't on the list of agencies people pick from. */
const EXCLUDED_INDEX_NAMES = new Set([".gov Administration"]);

const coverage: CoverageFile = Object.values(coverageFiles)[0] ?? { notCovered: [], unclear: [] };

/**
 * A responsible agency as the person confirmed it. `key` is "dir:<id>" for a
 * directory entry, "idx:<name>" for any other federal owner in the index.
 */
export interface AgencyRef {
  key: string;
  name: string;
  entryId?: string;
}

export function entryById(id: string | undefined): DirectoryEntry | undefined {
  return id ? ENTRIES.find((e) => e.id === id) : undefined;
}

export function displayName(entry: DirectoryEntry): string {
  return entry.parent && !entry.name.includes(entry.parent) ? `${entry.name} (${entry.parent})` : entry.name;
}

function refForIndexAgency(agency: string): AgencyRef {
  // Department-level entries match the index by name; "(including ...)" and
  // "U.S." vs "United States" don't count as differences.
  const wanted = normalizeAgencyName(agency);
  const entry = ENTRIES.find((e) => !e.parent && normalizeAgencyName(e.name) === wanted);
  return entry ? { key: `dir:${entry.id}`, name: displayName(entry), entryId: entry.id } : { key: `idx:${agency}`, name: agency };
}

export type ResolveResult =
  | { status: "match"; host: string; agency: AgencyRef }
  | { status: "no-match"; host: string }
  | { status: "not-a-link" };

/**
 * Find the responsible agency for a pasted link. A directory entry that lists
 * the host (or a parent) wins over the index, because the index's bureau field
 * reflects who registered a domain, not who takes complaints.
 */
export function resolveLink(input: string): ResolveResult {
  const host = hostFromInput(input);
  if (host === null) return { status: "not-a-link" };
  const candidates = hostAndParents(host);

  for (const candidate of candidates) {
    const entry = ENTRIES.find((e) => e.domains.includes(candidate));
    if (entry) return { status: "match", host, agency: { key: `dir:${entry.id}`, name: displayName(entry), entryId: entry.id } };
    const override = overrides[candidate];
    if (override) return { status: "match", host, agency: refForIndexAgency(override.agency) };
  }

  const found = lookupAgency(host, index);
  if (found.status === "match" && !EXCLUDED_INDEX_NAMES.has(found.agency)) {
    return { status: "match", host, agency: refForIndexAgency(found.agency) };
  }
  return { status: "no-match", host };
}

let optionsCache: AgencyRef[] | undefined;

/** Every agency a person can choose, alphabetically, directory entries included. */
export function agencyOptions(): AgencyRef[] {
  if (optionsCache) return optionsCache;
  const refs = new Map<string, AgencyRef>();
  for (const entry of ENTRIES) refs.set(`dir:${entry.id}`, { key: `dir:${entry.id}`, name: displayName(entry), entryId: entry.id });
  const indexNames = new Set(index.pairs.map(([agency]) => agency));
  for (const o of Object.values(overrides)) indexNames.add(o.agency);
  for (const name of indexNames) {
    if (!name || EXCLUDED_INDEX_NAMES.has(name)) continue;
    const ref = refForIndexAgency(name);
    refs.set(ref.key, ref);
  }
  optionsCache = [...refs.values()].sort((a, b) => a.name.localeCompare(b.name));
  return optionsCache;
}

export function agencyByKey(key: string | undefined): AgencyRef | undefined {
  return key ? agencyOptions().find((a) => a.key === key) : undefined;
}

/** Section 508 coverage of the owner, from data/coverage.json once it exists. */
export function coverageOf(ref: AgencyRef): "covered" | "not-covered" | "unclear" {
  const name = ref.key.startsWith("idx:") ? ref.key.slice(4) : ref.name;
  if (coverage.notCovered.includes(name)) return "not-covered";
  if (coverage.unclear.includes(name)) return "unclear";
  return "covered";
}

/** Compare agency names across sources: no "(USDA)" suffix, "U.S."/"The" prefix, case, or "&". */
export function normalizeAgencyName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^the\s+/i, "")
    .replace(/^(u\.s\.|united states)\s+/i, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Index names whose GSA listing name differs by more than spelling. */
const PM_LISTING_NAMES: Record<string, string> = {
  "Department of Defense": "Department of War",
  "Federal Communications Commission": "Federal Communication Commission",
  "Board of Governors of the Federal Reserve": "Federal Reserve Board of Governors",
  "Court Services and Offender Supervision Agency for the District of Columbia":
    "Court Services and Offender Supervision Agency for the District",
  "United States AbilityOne Commission": "Committee for Purchase from People Who Are Blind or Severely Disabled",
};

/** Program managers: the directory entry's, else GSA's listing for the whole agency. */
export function programManagersFor(ref: AgencyRef): { name: string; email: string; phone: string | null }[] {
  const entry = entryById(ref.entryId);
  if (entry?.pm) return [{ name: entry.pm.name, email: entry.pm.email, phone: null }];
  const listing = Object.values(pmFiles)[0];
  if (!listing) return [];
  const indexName = ref.key.startsWith("idx:") ? ref.key.slice(4) : (entry?.parent ?? entry?.name ?? ref.name);
  const wanted = normalizeAgencyName(PM_LISTING_NAMES[indexName] ?? indexName);
  return listing.agencies
    .filter((a) => !a.component && normalizeAgencyName(a.name) === wanted)
    .flatMap((a) => a.managers)
    .filter((m): m is { name: string; email: string; phone: string | null } => Boolean(m.email));
}
