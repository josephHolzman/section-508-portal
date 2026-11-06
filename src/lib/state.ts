/**
 * Answers live only in this browser tab (sessionStorage), so they survive a
 * reload or a slow session but disappear when the tab closes. Storage can be
 * blocked (private modes, strict settings); the tool must keep working, so
 * every read and write is guarded and falls back to memory.
 */

import type { BarrierId } from "../data/barriers";

export interface MemorableDate {
  month: string;
  day: string;
  year: string;
}

export type WhereKind = "link" | "app" | "document" | "work";

export interface WhereAnswers {
  kind?: WhereKind;
  url?: string;
  /** Set when the link was looked up: the host, and whether it matched. */
  host?: string;
  match?: "match" | "no-match";
  /** The agency the lookup found (an AgencyRef key), before the person confirms it. */
  matchedKey?: string;
  /** "yes" (the match is right), "other" (choose from the list), "state-local". */
  confirm?: "yes" | "other" | "state-local";
  /** The agency chosen from the list, when confirm is "other". */
  chosenKey?: string;
  /** The confirmed agency. */
  agencyKey?: string;
  agencyName?: string;
  /** Directory entry id, when the agency has one. */
  agencyId?: string;
}

export interface WhatHappenedAnswers {
  task: string;
  barriers: BarrierId[];
  somethingElse: string;
  details: string;
  date: MemorableDate;
  /** Undefined until the person sees the step; then prefilled from step 1. */
  page?: string;
}

export type OutcomeId = "fix" | "accessible-version" | "another-way" | "reply-in-writing";
export type AssistiveTechId =
  | "screen-reader"
  | "magnifier"
  | "voice"
  | "switch"
  | "captions"
  | "keyboard"
  | "other";

export interface WhatYouNeedAnswers {
  outcomes: OutcomeId[];
  hasDeadline?: "yes" | "no";
  deadline: MemorableDate;
  tech: AssistiveTechId[];
  techDetails: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Answers {
  version: 1;
  where?: WhereAnswers;
  whatHappened?: WhatHappenedAnswers;
  whatYouNeed?: WhatYouNeedAnswers;
  /** Review: include the "for your accessibility team" appendix. Defaults to true. */
  includeTechnical?: boolean;
  /** Send: the person's edited complaint, and the generated text it started from. */
  edited?: { text: string; basedOn: string };
}

const KEY = "barrier-report:answers";
let memory: Answers = { version: 1 };
/** False once a write fails; from then on the in-memory copy is the only one. */
let storageWritable = true;

export function emptyWhatHappened(): WhatHappenedAnswers {
  return {
    task: "",
    barriers: [],
    somethingElse: "",
    details: "",
    date: { month: "", day: "", year: "" },
  };
}

export function emptyWhatYouNeed(): WhatYouNeedAnswers {
  return {
    outcomes: [],
    deadline: { month: "", day: "", year: "" },
    tech: [],
    techDetails: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  };
}

export function loadAnswers(): Answers {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Answers;
      if (parsed && parsed.version === 1) memory = parsed;
    } else if (storageWritable) {
      // Storage works and holds nothing (cleared elsewhere): start fresh
      // rather than reviving answers the person no longer has.
      memory = { version: 1 };
    }
  } catch {
    // Storage blocked or corrupt: keep the in-memory copy.
  }
  return memory;
}

export function saveAnswers(next: Answers): void {
  memory = next;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
    storageWritable = true;
  } catch {
    storageWritable = false;
    // Storage blocked or full: answers still live in memory for this page.
  }
}

export function updateAnswers(change: (draft: Answers) => void): Answers {
  const draft = structuredClone(loadAnswers());
  change(draft);
  saveAnswers(draft);
  return draft;
}

export function clearAnswers(): void {
  memory = { version: 1 };
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
