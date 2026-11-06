import { describe, expect, it } from "vitest";
import { emptyWhatHappened, type WhatHappenedAnswers } from "../src/lib/state";
import { errorSummaryHeading, validateMemorableDate, validateWhatHappened } from "../src/lib/validate";
import { escapeHtml, html } from "../src/lib/html";

const TODAY = new Date(2026, 9, 14); // Oct 14, 2026 (local time)

const date = (month: string, day: string, year: string) => ({ month, day, year });

describe("validateMemorableDate", () => {
  it("accepts a blank date (the question is optional)", () => {
    expect(validateMemorableDate(date("", "", ""), TODAY)).toBeNull();
  });

  it.each([
    ["a full past date", date("10", "1", "2026")],
    ["today", date("10", "14", "2026")],
    ["month and year only", date("9", "", "2026")],
    ["year only", date("", "", "2025")],
    ["whitespace around values", date("10", " 3 ", " 2026 ")],
    ["a leap day", date("2", "29", "2024")],
  ])("accepts %s", (_label, value) => {
    expect(validateMemorableDate(value, TODAY)).toBeNull();
  });

  it.each([
    ["a missing year", date("10", "1", ""), ["year"], "Add the year it happened, or leave the whole date blank"],
    ["a two-digit year", date("10", "1", "26"), ["year"], "Enter the year as 4 numbers, like 2026"],
    ["a day with no month", date("", "5", "2026"), ["month"], "Choose the month, or remove the day"],
    ["a day that isn't a number", date("10", "fifth", "2026"), ["day"], "Enter the day as a number, like 15"],
    ["Feb 30", date("2", "30", "2026"), ["day"], "Enter a day that exists in that month"],
    ["Feb 29 in a non-leap year", date("2", "29", "2025"), ["day"], "Enter a day that exists in that month"],
    ["day 0", date("1", "0", "2026"), ["day"], "Enter a day that exists in that month"],
    ["a very old year", date("", "", "1999"), ["year"], "Check the year. Enter a year from 2000 to 2026"],
    ["tomorrow", date("10", "15", "2026"), ["month", "day", "year"], "The date can't be in the future"],
    ["next month", date("11", "", "2026"), ["month", "year"], "The date can't be in the future"],
    ["next year", date("", "", "2027"), ["year"], "The date can't be in the future"],
  ])("rejects %s", (_label, value, parts, message) => {
    expect(validateMemorableDate(value, TODAY)).toEqual({ parts, message });
  });
});

describe("validateWhatHappened", () => {
  const valid: WhatHappenedAnswers = {
    ...emptyWhatHappened(),
    task: "Apply for retirement benefits",
    barriers: ["keyboard"],
  };

  it("passes with only the required answers", () => {
    expect(validateWhatHappened(valid, TODAY)).toEqual([]);
  });

  it("reports missing required answers in page order, linked to the first control", () => {
    const errors = validateWhatHappened(emptyWhatHappened(), TODAY);
    expect(errors.map((e) => [e.key, e.targetId, e.message])).toEqual([
      ["task", "task", "Tell them what you were trying to do"],
      ["barriers", "barrier-keyboard", "Choose at least one thing that got in the way"],
    ]);
  });

  it("treats whitespace-only text as blank", () => {
    const errors = validateWhatHappened({ ...valid, task: "   \n " }, TODAY);
    expect(errors.map((e) => e.key)).toEqual(["task"]);
  });

  it("requires a description when Something else is chosen", () => {
    const errors = validateWhatHappened({ ...valid, barriers: ["other"] }, TODAY);
    expect(errors).toEqual([
      { key: "somethingElse", targetId: "something-else", message: "Describe what got in the way" },
    ]);
    expect(validateWhatHappened({ ...valid, barriers: ["other"], somethingElse: "A map" }, TODAY)).toEqual([]);
  });

  it("ignores a leftover description when Something else is unchecked", () => {
    expect(validateWhatHappened({ ...valid, somethingElse: "" }, TODAY)).toEqual([]);
  });

  it("links a date error to the first invalid part", () => {
    const errors = validateWhatHappened({ ...valid, date: date("10", "40", "2026") }, TODAY);
    expect(errors).toEqual([
      {
        key: "date",
        targetId: "date-day",
        message: "Enter a day that exists in that month",
        parts: ["day"],
      },
    ]);
  });
});

describe("errorSummaryHeading", () => {
  it("uses singular and plural wording", () => {
    expect(errorSummaryHeading(1)).toBe("There is a problem on this page");
    expect(errorSummaryHeading(2)).toBe("There are 2 problems on this page");
  });
});

describe("html", () => {
  it("escapes what people type", () => {
    const typed = `<img src=x onerror="alert(1)"> & 'quotes'`;
    expect(html`<p>${typed}</p>`.value).toBe(`<p>${escapeHtml(typed)}</p>`);
    expect(html`<p>${typed}</p>`.value).not.toContain("<img");
  });

  it("does not double-escape nested templates", () => {
    expect(html`<ul>${["a&b"].map((s) => html`<li>${s}</li>`)}</ul>`.value).toBe("<ul><li>a&amp;b</li></ul>");
  });
});
