import { beforeEach, describe, expect, it } from "vitest";
import { clearAnswers, loadAnswers, updateAnswers } from "../src/lib/state";

describe("answers in sessionStorage", () => {
  beforeEach(() => clearAnswers());

  it("persists updates", () => {
    updateAnswers((d) => (d.where = { kind: "app" }));
    expect(JSON.parse(sessionStorage.getItem("barrier-report:answers") ?? "{}").where).toEqual({ kind: "app" });
    expect(loadAnswers().where).toEqual({ kind: "app" });
  });

  it("doesn't revive answers after storage is cleared elsewhere", () => {
    updateAnswers((d) => (d.where = { kind: "app" }));
    sessionStorage.clear();
    expect(loadAnswers().where).toBeUndefined();
  });

  it("ignores corrupt storage", () => {
    sessionStorage.setItem("barrier-report:answers", "{not json");
    expect(loadAnswers()).toEqual({ version: 1 });
  });
});
