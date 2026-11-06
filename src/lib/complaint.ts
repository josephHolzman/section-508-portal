/**
 * Builds the complaint: plain text, first person, from the person's own
 * answers. Sections they left blank are left out, not shown empty. The
 * tool's name never appears: it's their complaint, not a form letter.
 * Pure; no DOM, no clock.
 */

import { BARRIERS, OTHER_BARRIER } from "../data/barriers";
import type { Answers, AssistiveTechId, MemorableDate, OutcomeId, WhereAnswers } from "./state";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "October 1, 2026", "October 2026", "2026", or "" for a blank date. */
export function formatDate(date: MemorableDate | undefined): string {
  if (!date) return "";
  const month = MONTHS[Number(date.month) - 1];
  const day = date.day.trim() ? String(Number(date.day)) : "";
  const year = date.year.trim();
  if (!year) return "";
  if (month && day) return `${month} ${day}, ${year}`;
  if (month) return `${month} ${year}`;
  return year;
}

const TECH_PHRASE: Record<AssistiveTechId, string> = {
  "screen-reader": "a screen reader",
  magnifier: "a screen magnifier or zoom",
  voice: "voice control",
  switch: "a switch device",
  captions: "captions",
  keyboard: "only a keyboard",
  other: "other assistive technology",
};

const OUTCOME_SENTENCE: Record<OutcomeId, string> = {
  fix: "Fix the barrier.",
  "accessible-version": "Give me an accessible version of the document.",
  "another-way": "Help me finish this task another way",
  "reply-in-writing": "Reply to me in writing.",
};

/** "a, b and c" */
function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The person's words as a sentence: first letter capitalized, ending punctuated. */
function sentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const capped = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

export interface ComplaintContext {
  /** Who the complaint is addressed to, e.g. "Department of the Treasury". */
  recipient: string;
  /** The office whose site, app or document it is, when it differs from the recipient. */
  owner?: string;
}

function placePhrase(where: WhereAnswers | undefined, ctx: ComplaintContext): string {
  const of = ctx.owner ? ` run by the ${ctx.owner}` : "";
  switch (where?.kind) {
    case "link":
      return where.host ? `on ${where.host}${of}` : `on your website${of}`;
    case "app":
      return ctx.owner ? `in a mobile app from the ${ctx.owner}` : "in your mobile app";
    case "document":
      return ctx.owner ? `in a document from the ${ctx.owner}` : "in a document from your agency";
    case "work":
      return "in a system I use at work";
    default:
      return "in your technology";
  }
}

/** The possibly related WCAG 2.0 criteria for the chosen barriers, deduplicated, in order. */
export function wcagReferences(answers: Answers): string[] {
  const chosen = answers.whatHappened?.barriers ?? [];
  const refs: string[] = [];
  for (const b of BARRIERS) {
    if (!chosen.includes(b.id)) continue;
    for (const c of b.wcag) if (!refs.includes(c)) refs.push(c);
  }
  return refs;
}

/**
 * "Accessibility complaint (Section 508): apply for retirement benefits on ssa.gov".
 * The task goes in only when it's short enough to read as a subject line.
 */
export function complaintSubject(answers: Answers): string {
  const base = "Accessibility complaint (Section 508)";
  const task = answers.whatHappened?.task.trim().replace(/[.!?]+$/, "") ?? "";
  const host = answers.where?.kind === "link" ? answers.where.host : undefined;
  const shortTask = task && task.length <= 60 && !task.includes("\n") ? task.charAt(0).toLowerCase() + task.slice(1) : "";
  if (shortTask) return `${base}: ${shortTask}${host ? ` on ${host}` : ""}`;
  return host ? `${base}: ${host}` : base;
}

export function buildComplaint(answers: Answers, ctx: ComplaintContext, includeTechnical: boolean): string {
  const happened = answers.whatHappened;
  const need = answers.whatYouNeed;
  const sections: string[] = [];

  sections.push(`Subject: ${complaintSubject(answers)}`);
  sections.push(`To the ${ctx.recipient}:`);
  sections.push(
    `I am filing a complaint under Section 508 of the Rehabilitation Act about an accessibility barrier ${placePhrase(answers.where, ctx)}.`,
  );

  if (happened?.task.trim()) {
    sections.push(`What I was trying to do:\n${sentence(happened.task)}`);
  }

  if (happened && happened.barriers.length > 0) {
    const lines = BARRIERS.filter((b) => happened.barriers.includes(b.id)).map((b) =>
      b.id === OTHER_BARRIER ? `- ${sentence(happened.somethingElse) || "Something else."}` : `- ${b.label}.`,
    );
    sections.push(`What got in the way:\n${lines.join("\n")}`);
  }

  if (happened?.details.trim()) {
    sections.push(`In my own words:\n${happened.details.trim()}`);
  }

  const when = formatDate(happened?.date);
  const page = happened?.page?.trim() ?? "";
  if (when && page) sections.push(`When and where:\n${when}, at ${page}`);
  else if (when) sections.push(`When:\n${when}`);
  else if (page) sections.push(`Where:\n${page}`);

  if (need && (need.tech.length > 0 || need.techDetails.trim())) {
    const parts: string[] = [];
    if (need.tech.length > 0) parts.push(`I use ${joinList(need.tech.map((t) => TECH_PHRASE[t]))}.`);
    if (need.techDetails.trim()) parts.push(sentence(need.techDetails));
    sections.push(`How I use technology:\n${parts.join(" ")}`);
  }

  if (need && need.outcomes.length > 0) {
    const deadline = need.hasDeadline === "yes" ? formatDate(need.deadline) : "";
    const lines = need.outcomes.map((o) => {
      if (o === "another-way") return `- ${OUTCOME_SENTENCE[o]}${deadline ? ` before ${deadline}` : ""}.`;
      return `- ${OUTCOME_SENTENCE[o]}`;
    });
    if (deadline && !need.outcomes.includes("another-way")) lines.push(`- I need this resolved by ${deadline}.`);
    sections.push(`What I am asking for:\n${lines.join("\n")}`);
  }

  if (need) {
    const contact = [need.name, need.email, need.phone, need.address].map((s) => s.trim()).filter(Boolean);
    if (contact.length > 0) sections.push(`How to reach me:\n${contact.join("\n")}`);
    if (need.name.trim()) sections.push(`Thank you,\n${need.name.trim()}`);
  }

  if (includeTechnical) {
    const refs = wcagReferences(answers);
    if (refs.length > 0) {
      sections.push(`For your accessibility team (possibly related WCAG 2.0 criteria):\n${refs.join("; ")}`);
    }
  }

  return sections.join("\n\n") + "\n";
}
