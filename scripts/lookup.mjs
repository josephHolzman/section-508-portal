// Domain -> agency lookup for Barrier Report.
// Pure, dependency-free; uses only the WHATWG URL global (browser + Node).
// Written to port to TypeScript as-is: add the types in the JSDoc comments below.
//
// type DomainIndex = { v: 1; pairs: [agency: string, bureau: string][]; domains: Record<string, number> };
// type LookupResult =
//   | { status: 'match'; agency: string; bureau: string | null; matchedOn: string }
//   | { status: 'no-match'; host: string }
//   | { status: 'not-a-link' };

const SCHEME_WITH_SLASHES = /^[a-z][a-z0-9+.-]*:\/\//i;
// "mailto:", "javascript:", "tel:" etc. A digit after the colon means host:port ("ssa.gov:443").
const OTHER_SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/i;
const HOSTNAME = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]*[a-z0-9]$/;

/**
 * Extract a normalized host from user-pasted text, or null if it is not a web link.
 * @param {string} input
 * @returns {string | null}
 */
export function hostFromInput(input) {
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  let candidate;
  if (SCHEME_WITH_SLASHES.test(text)) candidate = text;
  else if (OTHER_SCHEME.test(text)) return null;
  else candidate = 'https://' + text.replace(/^\/+/, '');
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  let host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host.startsWith('www.')) host = host.slice(4);
  return HOSTNAME.test(host) ? host : null;
}

/**
 * Look up the federal agency (and bureau) responsible for a pasted link.
 * Exact host first, then each parent domain ("subdomains match their parent").
 * @param {string} input
 * @param {{ pairs: string[][], domains: Record<string, number> }} index
 * @returns {LookupResult}
 */
export function lookupAgency(input, index) {
  const host = hostFromInput(input);
  if (host === null) return { status: 'not-a-link' };
  let candidate = host;
  // Stop before the bare TLD: "gov" / "mil" / "com" are never keys.
  while (candidate.includes('.')) {
    const i = Object.prototype.hasOwnProperty.call(index.domains, candidate) ? index.domains[candidate] : undefined;
    if (i !== undefined) {
      const pair = index.pairs[i];
      if (pair && pair[0]) {
        return { status: 'match', agency: pair[0], bureau: pair[1] || null, matchedOn: candidate };
      }
    }
    candidate = candidate.slice(candidate.indexOf('.') + 1);
  }
  return { status: 'no-match', host };
}
