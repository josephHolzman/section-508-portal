/** Shared USWDS compositions used by more than one step. */

import { html, type SafeHtml } from "./html";
import type { FieldError } from "./validate";
import type { MemorableDate } from "./state";
import { errorSummaryHeading } from "./validate";
import { STEPS, stepNumber, type StepId } from "../steps/steps";

/**
 * USWDS step indicator. Its heading is the page's h1, so the step counter
 * and the step name are announced together when focus moves to it.
 */
export function stepIndicator(current: StepId, title?: string): SafeHtml {
  const n = stepNumber(current);
  const step = STEPS[n - 1];
  return html`
    <div class="usa-step-indicator page-block">
      <ol class="usa-step-indicator__segments">
        ${STEPS.map((s, i) => {
          const status = i + 1 < n ? "complete" : i + 1 === n ? "current" : "incomplete";
          return html`<li
            class="usa-step-indicator__segment ${status === "complete"
              ? "usa-step-indicator__segment--complete"
              : status === "current"
                ? "usa-step-indicator__segment--current"
                : ""}"
            ${status === "current" ? html`aria-current="step"` : ""}
          >
            <span class="usa-step-indicator__segment-label"
              >${s.label}${status === "complete"
                ? html`<span class="usa-sr-only"> completed</span>`
                : status === "incomplete"
                  ? html`<span class="usa-sr-only"> not completed</span>`
                  : ""}</span
            >
          </li>`;
        })}
      </ol>
      <div class="usa-step-indicator__header">
        <h1 class="usa-step-indicator__heading" id="page-heading" tabindex="-1">
          <span class="usa-step-indicator__heading-counter"
            ><span class="usa-sr-only">Step</span>
            <span class="usa-step-indicator__current-step">${n}</span>
            <span class="usa-step-indicator__total-steps">of ${STEPS.length}</span></span
          >
          <span class="usa-step-indicator__heading-text">${title ?? step?.title ?? ""}</span>
        </h1>
      </div>
    </div>
  `;
}

/**
 * Error summary: USWDS has no component for this, so it's an error alert with
 * a list of links, following GOV.UK's tested pattern: the summary takes focus
 * after a failed Continue, and its contents sit in a role="alert" wrapper so
 * they're announced even where focusing a container reads nothing. Each link
 * moves focus to its field (handled by the step).
 */
export function errorSummary(errors: FieldError[]): SafeHtml {
  if (errors.length === 0) return html``;
  return html`
    <div
      class="usa-alert usa-alert--error page-block error-summary"
      id="error-summary"
      tabindex="-1"
    >
      <div class="usa-alert__body" role="alert">
        <h2 class="usa-alert__heading">${errorSummaryHeading(errors.length)}</h2>
        <ul class="usa-list usa-list--unstyled error-summary__list">
          ${errors.map(
            (e) => html`<li><a class="usa-link" href="#${e.targetId}" data-error-target="${e.targetId}">${e.message}</a></li>`,
          )}
        </ul>
      </div>
    </div>
  `;
}

/** Inline error message, with a hidden "Error:" prefix for screen readers. */
export function errorMessage(id: string, error: FieldError | undefined): SafeHtml {
  if (!error) return html``;
  return html`<span class="usa-error-message" id="${id}"
    ><span class="usa-sr-only">Error: </span>${error.message}</span
  >`;
}

/** ids for aria-describedby, skipping any that aren't rendered. */
export function describedBy(...ids: (string | false | undefined)[]): string {
  return ids.filter(Boolean).join(" ");
}

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

/**
 * USWDS memorable date (3.14.0: the month is a select). Field ids are
 * `<prefix>-month`, `-day`, `-year`; names are the same.
 */
export function memorableDate(opts: {
  prefix: string;
  legend: SafeHtml | string;
  hint: string;
  value: MemorableDate;
  error?: FieldError;
}): SafeHtml {
  const { prefix, value, error } = opts;
  const invalid = (part: string) => Boolean(error?.parts?.includes(part as "month" | "day" | "year"));
  const errClass = (part: string) => (invalid(part) ? "usa-input--error" : "");
  const ariaInvalid = (part: string) => (invalid(part) ? html`aria-invalid="true"` : "");
  return html`
    <div class="usa-form-group ${error ? "usa-form-group--error" : ""}">
      <fieldset class="usa-fieldset" aria-describedby="${describedBy(error && `${prefix}-error`, `${prefix}-hint`)}">
        <legend class="usa-legend">${opts.legend}</legend>
        <span class="usa-hint" id="${prefix}-hint">${opts.hint}</span>
        ${errorMessage(`${prefix}-error`, error)}
        <div class="usa-memorable-date">
          <div class="usa-form-group usa-form-group--month usa-form-group--select">
            <label class="usa-label" for="${prefix}-month">Month</label>
            <select class="usa-select ${errClass("month")}" id="${prefix}-month" name="${prefix}-month" ${ariaInvalid("month")}>
              <option value="">- Select -</option>
              ${MONTHS.map(
                (name, i) =>
                  html`<option value="${i + 1}" ${value.month === String(i + 1) ? html`selected` : ""}>${name}</option>`,
              )}
            </select>
          </div>
          <div class="usa-form-group usa-form-group--day">
            <label class="usa-label" for="${prefix}-day">Day</label>
            <input
              class="usa-input ${errClass("day")}"
              id="${prefix}-day"
              name="${prefix}-day"
              maxlength="2"
              inputmode="numeric"
              value="${value.day}"
              ${ariaInvalid("day")}
            />
          </div>
          <div class="usa-form-group usa-form-group--year">
            <label class="usa-label" for="${prefix}-year">Year</label>
            <input
              class="usa-input ${errClass("year")}"
              id="${prefix}-year"
              name="${prefix}-year"
              minlength="4"
              maxlength="4"
              inputmode="numeric"
              value="${value.year}"
              ${ariaInvalid("year")}
            />
          </div>
        </div>
      </fieldset>
    </div>
  `;
}

/** Read a memorable date written by `memorableDate` out of form data. */
export function readMemorableDate(data: FormData, prefix: string): MemorableDate {
  const str = (name: string) => String(data.get(`${prefix}-${name}`) ?? "");
  return { month: str("month"), day: str("day"), year: str("year") };
}
