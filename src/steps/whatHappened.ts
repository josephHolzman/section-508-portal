/**
 * Step 2, "What happened?": the hero screen.
 *
 * Turns the experience into what an agency needs: the task, the barrier,
 * where, and when. Plain language only; no technical term is ever required.
 */

import { BARRIERS, OTHER_BARRIER, isBarrierId, type BarrierId } from "../data/barriers";
import { describedBy, errorMessage, errorSummary, memorableDate, readMemorableDate, stepIndicator } from "../lib/components";
import { html } from "../lib/html";
import { formActions, runFormPage } from "../lib/form";
import {
  emptyWhatHappened,
  loadAnswers,
  updateAnswers,
  type WhatHappenedAnswers,
  type WhereAnswers,
  type WhereKind,
} from "../lib/state";
import { validateWhatHappened, type FieldError } from "../lib/validate";
import type { Nav, ShowOptions } from "../router";
import { stepDocumentTitle } from "./steps";


const KIND_LABEL: Record<WhereKind, string> = {
  link: "On a website",
  app: "In an app",
  document: "In a document",
  work: "In a system at work",
};

function contextLine(where: WhereAnswers | undefined, nav: Nav) {
  if (!where) return html``;
  const place = where.host ? `On ${where.host}` : where.kind ? KIND_LABEL[where.kind] : "";
  const parts = [place, where.agencyName].filter(Boolean).join(" · ");
  return html`<p class="context-line">
    ${parts} ·
    <a class="usa-link" href="${nav.href("where")}">Change<span class="usa-sr-only"> where it happened or the agency</span></a>
  </p>`;
}

function requiredMark() {
  return html`<span class="required-mark" aria-hidden="true">*</span>`;
}

function view(values: WhatHappenedAnswers, where: WhereAnswers | undefined, errors: FieldError[], nav: Nav, backHref: string) {
  const err = (key: FieldError["key"]) => errors.find((e) => e.key === key);
  const taskErr = err("task");
  const barriersErr = err("barriers");
  const otherErr = err("somethingElse");
  const dateErr = err("date");
  const otherChecked = values.barriers.includes(OTHER_BARRIER);
  const pageHint = where?.kind === "link"
    ? "Change this if it happened on a different page, or add the document's name."
    : "For example, the page address, the app's name, or the document's title.";

  return html`
    ${stepIndicator("what-happened")}
    ${errorSummary(errors)}
    ${contextLine(where, nav)}

    <form class="usa-form usa-form--large step-form" id="what-happened-form" novalidate>
      <p class="usa-hint margin-top-0">
        A red asterisk (<span class="required-mark">*</span>) marks a required question. You don't need to know any
        technical terms.
      </p>

      <div class="usa-form-group ${taskErr ? "usa-form-group--error" : ""}">
        <label class="usa-label ${taskErr ? "usa-label--error" : ""}" for="task">
          What were you trying to do? ${requiredMark()}
        </label>
        <span class="usa-hint" id="task-hint">For example: apply for retirement benefits, or read my benefits letter.</span>
        ${errorMessage("task-error", taskErr)}
        <textarea
          class="usa-textarea usa-textarea--short ${taskErr ? "usa-input--error" : ""}"
          id="task"
          name="task"
          rows="3"
          required
          aria-describedby="${describedBy(taskErr && "task-error", "task-hint")}"
          ${taskErr ? html`aria-invalid="true"` : ""}
        >${values.task}</textarea>
      </div>

      <div class="usa-form-group ${barriersErr || otherErr ? "usa-form-group--error" : ""}">
        <fieldset class="usa-fieldset" aria-describedby="${describedBy(barriersErr && "barriers-error", "barriers-hint")}">
          <legend class="usa-legend">
            What got in the way? ${requiredMark()}<span class="usa-sr-only"> (required)</span>
          </legend>
          <span class="usa-hint" id="barriers-hint">Select all that apply.</span>
          ${errorMessage("barriers-error", barriersErr)}
          ${BARRIERS.map((b) => {
            const checked = values.barriers.includes(b.id);
            const tile = html`
              <div class="usa-checkbox">
                <input
                  class="usa-checkbox__input usa-checkbox__input--tile"
                  id="barrier-${b.id}"
                  type="checkbox"
                  name="barriers"
                  value="${b.id}"
                  ${checked ? html`checked` : ""}
                  ${b.id === OTHER_BARRIER ? html`data-reveals="something-else-group" aria-controls="something-else-group"` : ""}
                />
                <label class="usa-checkbox__label" for="barrier-${b.id}">
                  ${b.label}
                  <span class="usa-checkbox__label-description">${b.description}</span>
                </label>
              </div>
            `;
            if (b.id !== OTHER_BARRIER) return tile;
            return html`${tile}
              <div
                class="usa-form-group conditional-field ${otherErr ? "usa-form-group--error" : ""}"
                id="something-else-group"
                ${otherChecked ? "" : html`hidden`}
              >
                <label class="usa-label ${otherErr ? "usa-label--error" : ""}" for="something-else">
                  Describe what got in the way ${requiredMark()}
                </label>
                ${errorMessage("something-else-error", otherErr)}
                <textarea
                  class="usa-textarea usa-textarea--short ${otherErr ? "usa-input--error" : ""}"
                  id="something-else"
                  name="somethingElse"
                  rows="3"
                  required
                  ${otherErr ? html`aria-invalid="true" aria-describedby="something-else-error"` : ""}
                >${values.somethingElse}</textarea>
              </div>`;
          })}
        </fieldset>
      </div>

      <div class="usa-form-group">
        <label class="usa-label" for="details">Tell them more <span class="optional">(optional)</span></label>
        <span class="usa-hint" id="details-hint">
          In your own words. Details like which button or which page make it easier to fix.
        </span>
        <textarea class="usa-textarea" id="details" name="details" rows="5" aria-describedby="details-hint">${values.details}</textarea>
      </div>

      ${memorableDate({
        prefix: "date",
        legend: html`When did this happen? <span class="optional">(optional)</span>`,
        hint: "If you're not sure, give your best guess or leave it blank. The month and year are enough.",
        value: values.date,
        error: dateErr,
      })}

      <div class="usa-form-group">
        <label class="usa-label" for="page">Which page or document? <span class="optional">(optional)</span></label>
        <span class="usa-hint" id="page-hint">${pageHint}</span>
        <input class="usa-input" id="page" name="page" type="text" autocomplete="off" aria-describedby="page-hint" value="${values.page ?? ""}" />
      </div>

      ${formActions("Continue", backHref)}
    </form>
  `;
}

function readForm(form: HTMLFormElement, previous: WhatHappenedAnswers): WhatHappenedAnswers {
  const data = new FormData(form);
  const str = (name: string) => String(data.get(name) ?? "");
  const barriers = data
    .getAll("barriers")
    .map(String)
    .filter((v): v is BarrierId => isBarrierId(v));
  return {
    ...previous,
    task: str("task"),
    barriers,
    somethingElse: str("somethingElse"),
    details: str("details"),
    date: readMemorableDate(data, "date"),
    page: str("page"),
  };
}

export function showWhatHappened(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  const answers = loadAnswers();
  const where = answers.where;

  // Never re-ask (WCAG 3.3.7): carry the link from step 1 into "Which page?"
  // the first time this step is shown. After that, the person's edit wins.
  let values = answers.whatHappened ?? emptyWhatHappened();
  if (values.page === undefined) {
    values = { ...values, page: where?.url ?? "" };
    updateAnswers((d) => (d.whatHappened = values));
  }

  const fromReview = options.params.get("from") === "review";
  const backHref = fromReview ? nav.href("review") : nav.href("agency");

  runFormPage({
    main,
    options,
    formId: "what-happened-form",
    title: (hasErrors) => stepDocumentTitle("what-happened", hasErrors),
    render: (errors) => view(values, where, errors, nav, backHref),
    // Answers persist as the person types, so nothing is lost on reload.
    persist: (form) => {
      values = readForm(form, values);
      updateAnswers((d) => (d.whatHappened = values));
    },
    validate: () => validateWhatHappened(values, new Date()),
    onValid: () => nav.go(fromReview ? "review" : "what-you-need"),
  });
}
