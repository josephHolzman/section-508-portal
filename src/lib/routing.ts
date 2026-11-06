/**
 * Where the complaint goes, worked out from the confirmed agency and the
 * directory. Pure apart from reading the bundled directory.
 */

import {
  USING_DRAFTS_AS_VERIFIED,
  agencyByKey,
  entryById,
  isVerified,
  programManagersFor,
  type Channel,
  type DirectoryEntry,
} from "../data/directory";
import type { ComplaintContext } from "./complaint";
import type { Answers } from "./state";

export const STALE_AFTER_DAYS = 180;

export interface SendPlan {
  /** The agency as the person confirmed it. */
  agencyName: string;
  context: ComplaintContext;
  entry?: DirectoryEntry;
  verified: boolean;
  /** True when draft directory data is being shown as if verified (local testing only). */
  draftData: boolean;
  complaintChannels: Channel[];
  feedbackChannels: Channel[];
  programManagers: { name: string; email: string; phone: string | null }[];
  phone?: { number: string; label: string; source: string };
  filingWindow?: { days: number; source: string };
  lastChecked?: string;
  stale: boolean;
}

/** A mailed complaint the agency says must be signed. */
export function needsSignature(channel: Channel): boolean {
  return /\bsigned\b/i.test(channel.instructionsQuote ?? "");
}

export function daysBetween(a: Date, b: Date): number {
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end - start) / 86_400_000);
}

export function planSend(answers: Answers, today: Date): SendPlan {
  const where = answers.where;
  const ref = agencyByKey(where?.agencyKey);
  const agencyName = ref?.name ?? where?.agencyName ?? "agency";
  const entry = entryById(ref?.entryId ?? where?.agencyId);
  const verified = entry ? isVerified(entry) : false;

  const context: ComplaintContext = entry
    ? entry.parent
      ? { recipient: entry.parent, owner: entry.name.replace(` (${entry.parent})`, "") }
      : { recipient: entry.name }
    : { recipient: agencyName };

  const lastChecked = entry?.lastChecked ?? undefined;
  const stale = lastChecked ? daysBetween(new Date(`${lastChecked}T00:00:00`), today) > STALE_AFTER_DAYS : false;

  return {
    agencyName,
    context,
    entry,
    verified,
    draftData: Boolean(entry && verified && entry.lastChecked === null && USING_DRAFTS_AS_VERIFIED),
    complaintChannels: verified && entry ? entry.channels.filter((c) => c.purpose === "complaint") : [],
    feedbackChannels: verified && entry ? entry.channels.filter((c) => c.purpose === "feedback") : [],
    programManagers: ref ? programManagersFor(ref) : [],
    phone: verified ? (entry?.phone ?? undefined) : undefined,
    filingWindow:
      verified && entry?.filingWindowDays && entry.filingWindowSource
        ? { days: entry.filingWindowDays, source: entry.filingWindowSource }
        : undefined,
    lastChecked,
    stale,
  };
}

/** Days since the incident, when the person gave a full date; otherwise null. */
export function daysSinceIncident(answers: Answers, today: Date): number | null {
  const date = answers.whatHappened?.date;
  if (!date || !date.month || !date.day.trim() || !date.year.trim()) return null;
  const when = new Date(Number(date.year), Number(date.month) - 1, Number(date.day));
  if (Number.isNaN(when.getTime())) return null;
  return daysBetween(when, today);
}
