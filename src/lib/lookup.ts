/**
 * Domain → agency lookup, ported from scripts/lookup.mjs (which the Day 1
 * test exercised against 29 inputs). Pure; no DOM.
 */

export interface DomainIndex {
  v: 1;
  pairs: [agency: string, bureau: string][];
  domains: Record<string, number>;
}

export type LookupResult =
  | { status: "match"; host: string; agency: string; bureau: string | null; matchedOn: string }
  | { status: "no-match"; host: string }
  | { status: "not-a-link" };

const SCHEME_WITH_SLASHES = /^[a-z][a-z0-9+.-]*:\/\//i;
// "mailto:", "javascript:", "tel:" and the like. A digit after the colon is host:port.
const OTHER_SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/i;
const HOSTNAME = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]*[a-z0-9]$/;

/** A normalized host from pasted text ("www." stripped), or null if it isn't a web link. */
export function hostFromInput(input: string): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  let candidate: string;
  if (SCHEME_WITH_SLASHES.test(text)) candidate = text;
  else if (OTHER_SCHEME.test(text)) return null;
  else candidate = "https://" + text.replace(/^\/+/, "");
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  let host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host.startsWith("www.")) host = host.slice(4);
  return HOSTNAME.test(host) ? host : null;
}

/** Each candidate key for a host: itself, then each parent, stopping before the TLD. */
export function hostAndParents(host: string): string[] {
  const out: string[] = [];
  let candidate = host;
  while (candidate.includes(".")) {
    out.push(candidate);
    candidate = candidate.slice(candidate.indexOf(".") + 1);
  }
  return out;
}

/** Exact host first, then each parent domain ("subdomains match their parent"). */
export function lookupAgency(input: string, index: DomainIndex): LookupResult {
  const host = hostFromInput(input);
  if (host === null) return { status: "not-a-link" };
  for (const candidate of hostAndParents(host)) {
    const i = Object.prototype.hasOwnProperty.call(index.domains, candidate) ? index.domains[candidate] : undefined;
    if (i === undefined) continue;
    const pair = index.pairs[i];
    if (pair && pair[0]) {
      return { status: "match", host, agency: pair[0], bureau: pair[1] || null, matchedOn: candidate };
    }
  }
  return { status: "no-match", host };
}
