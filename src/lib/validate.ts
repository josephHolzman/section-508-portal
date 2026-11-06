/**
 * Validation for "What happened?". Pure functions: no DOM, no clock.
 * Messages say what to do, never blame the person (spec, state 8).
 */

import { OTHER_BARRIER } from "../data/barriers";
import type { MemorableDate, WhatHappenedAnswers, WhatYouNeedAnswers } from "./state";

export type DatePart = "month" | "day" | "year";

export interface FieldError {
  /** Which answer this error belongs to. */
  key: string;
  /** id of the control the error summary link moves focus to. */
  targetId: string;
  message: string;
  /** For the date only: which of month, day, year to mark invalid. */
  parts?: DatePart[];
}

export const EARLIEST_YEAR = 2000;

const blank = (s: string | undefined) => !s || s.trim() === "";

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * The date is optional, and a best guess is fine: a year alone, or a month
 * and year, are accepted. A day needs a month; anything needs a year.
 */
export function validateMemorableDate(
  date: MemorableDate,
  today: Date,
): { message: string; parts: DatePart[] } | null {
  const month = date.month.trim();
  const day = date.day.trim();
  const year = date.year.trim();

  if (!month && !day && !year) return null;

  if (day && !/^\d{1,2}$/.test(day)) {
    return { message: "Enter the day as a number, like 15", parts: ["day"] };
  }
  if (!year) {
    return { message: "Add the year it happened, or leave the whole date blank", parts: ["year"] };
  }
  if (!/^\d{4}$/.test(year)) {
    return { message: `Enter the year as 4 numbers, like ${today.getFullYear()}`, parts: ["year"] };
  }
  if (day && !month) {
    return { message: "Choose the month, or remove the day", parts: ["month"] };
  }

  const y = Number(year);
  const m = month ? Number(month) : null;
  const d = day ? Number(day) : null;

  if (m !== null && (!Number.isInteger(m) || m < 1 || m > 12)) {
    return { message: "Choose the month from the list", parts: ["month"] };
  }
  if (y < EARLIEST_YEAR) {
    return {
      message: `Check the year. Enter a year from ${EARLIEST_YEAR} to ${today.getFullYear()}`,
      parts: ["year"],
    };
  }
  if (m !== null && d !== null && (d < 1 || d > daysInMonth(y, m))) {
    return { message: "Enter a day that exists in that month", parts: ["day"] };
  }

  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  const future =
    y > ty ||
    (y === ty && m !== null && m > tm) ||
    (y === ty && m === tm && d !== null && d > td);
  if (future) {
    const parts: DatePart[] = ["year"];
    if (m !== null) parts.unshift("month");
    if (d !== null) parts.splice(1, 0, "day");
    return { message: "The date can't be in the future", parts };
  }

  return null;
}

export const DATE_PART_IDS: Record<DatePart, string> = {
  month: "date-month",
  day: "date-day",
  year: "date-year",
};

/** Errors in the same order as the fields on the page. */
export function validateWhatHappened(values: WhatHappenedAnswers, today: Date): FieldError[] {
  const errors: FieldError[] = [];

  if (blank(values.task)) {
    errors.push({ key: "task", targetId: "task", message: "Tell them what you were trying to do" });
  }

  if (values.barriers.length === 0) {
    errors.push({
      key: "barriers",
      targetId: "barrier-keyboard",
      message: "Choose at least one thing that got in the way",
    });
  } else if (values.barriers.includes(OTHER_BARRIER) && blank(values.somethingElse)) {
    errors.push({
      key: "somethingElse",
      targetId: "something-else",
      message: "Describe what got in the way",
    });
  }

  const dateError = validateMemorableDate(values.date, today);
  if (dateError) {
    const first = dateError.parts[0] ?? "month";
    errors.push({
      key: "date",
      targetId: DATE_PART_IDS[first],
      message: dateError.message,
      parts: dateError.parts,
    });
  }

  return errors;
}

export function errorSummaryHeading(count: number): string {
  return count === 1 ? "There is a problem on this page" : `There are ${count} problems on this page`;
}

/** A deadline must be a whole, real date, today or later. */
export function validateDeadline(date: MemorableDate, today: Date): { message: string; parts: DatePart[] } | null {
  const month = date.month.trim();
  const day = date.day.trim();
  const year = date.year.trim();
  if (!month && !day && !year) return { message: "Enter the date you need this by", parts: ["month", "day", "year"] };
  if (!month) return { message: "Choose the month", parts: ["month"] };
  if (!day) return { message: "Add the day", parts: ["day"] };
  if (!/^\d{1,2}$/.test(day)) return { message: "Enter the day as a number, like 15", parts: ["day"] };
  if (!year) return { message: "Add the year", parts: ["year"] };
  if (!/^\d{4}$/.test(year)) {
    return { message: `Enter the year as 4 numbers, like ${today.getFullYear()}`, parts: ["year"] };
  }
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(m) || m < 1 || m > 12) return { message: "Choose the month from the list", parts: ["month"] };
  if (d < 1 || d > daysInMonth(y, m)) return { message: "Enter a day that exists in that month", parts: ["day"] };
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (new Date(y, m - 1, d) < startOfToday) {
    return { message: "The date must be today or later", parts: ["month", "day", "year"] };
  }
  return null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Errors for "What do you need?", in page order. */
export function validateWhatYouNeed(values: WhatYouNeedAnswers, today: Date): FieldError[] {
  const errors: FieldError[] = [];
  if (values.outcomes.length === 0) {
    errors.push({ key: "outcomes", targetId: "outcome-fix", message: "Choose what you want to happen" });
  }
  if (values.hasDeadline === "yes") {
    const dateError = validateDeadline(values.deadline, today);
    if (dateError) {
      errors.push({
        key: "deadline",
        targetId: `deadline-${dateError.parts[0] ?? "month"}`,
        message: dateError.message,
        parts: dateError.parts,
      });
    }
  }
  if (blank(values.name)) {
    errors.push({ key: "name", targetId: "contact-name", message: "Enter your name" });
  }
  if (blank(values.email) && blank(values.phone) && blank(values.address)) {
    errors.push({
      key: "contact",
      targetId: "contact-email",
      message: "Give at least one way to reach you: email, phone, or mailing address",
    });
  } else if (!blank(values.email) && !EMAIL.test(values.email.trim())) {
    errors.push({
      key: "email",
      targetId: "contact-email",
      message: "Enter an email address like name@example.com",
    });
  }
  return errors;
}
