/**
 * Step 4, "Review your complaint": every answer with a Change link that
 * returns to the exact field (and back here on Continue), the technical
 * appendix toggle, and a read-only preview of the complaint.
 */

import { BARRIERS, OTHER_BARRIER } from "../data/barriers";
import { stepIndicator } from "../lib/components";
import { buildComplaint, formatDate } from "../lib/complaint";
import { formActions } from "../lib/form";
import { html, mount, type SafeHtml } from "../lib/html";
import { daysSinceIncident, planSend } from "../lib/routing";
import { loadAnswers, updateAnswers, type Answers } from "../lib/state";
import type { Nav, ShowOptions } from "../router";
import type { PageId } from "./steps";
import { stepDocumentTitle } from "./steps";
import { OUTCOMES, TECH } from "./whatYouNeed";

/** Spec state 11: warn once the incident is this many days old. */
export const LATE_WARNING_DAYS = 150;

interface Row {
  term: string;
  value: SafeHtml | string;
  page: PageId;
  focus: string;
  /** Screen-reader context for the Change link, e.g. "what you were trying to do". */
  changeLabel: string;
}

const NOT_ANSWERED = html`<span class="text-base-dark">Not answered</span>`;

function list(items: string[]): SafeHtml | string {
  if (items.length === 0) return NOT_ANSWERED;
  if (items.length === 1) return items[0] ?? "";
  return html`<ul class="usa-list margin-0">${items.map((i) => html`<li>${i}</li>`)}</ul>`;
}

function text(value: string | undefined): SafeHtml | string {
  return value?.trim() ? value.trim() : NOT_ANSWERED;
}

export function reviewRows(answers: Answers): Row[] {
  const where = answers.where;
  const happened = answers.whatHappened;
  const need = answers.whatYouNeed;
  const barrierLabels = BARRIERS.filter((b) => happened?.barriers.includes(b.id)).map((b) =>
    b.id === OTHER_BARRIER ? `Something else: ${happened?.somethingElse.trim() ?? ""}` : b.label,
  );
  const whereValue =
    where?.kind === "link"
      ? (where.url ?? "")
      : where?.kind === "app"
        ? "A mobile app"
        : where?.kind === "document"
          ? "A document"
          : "A system at work";
  const contact = need ? [need.name, need.email, need.phone, need.address].map((s) => s.trim()).filter(Boolean) : [];

  return [
    {
      term: "Agency",
      value: text(where?.agencyName),
      page: "agency",
      focus: where?.kind !== "link" ? "agency-select" : where.match === "match" ? "confirm-yes" : "confirm-other",
      changeLabel: "agency",
    },
    { term: "Where", value: whereValue, page: "where", focus: where?.kind === "link" ? "link" : "kind-link", changeLabel: "where it happened" },
    { term: "What you were trying to do", value: text(happened?.task), page: "what-happened", focus: "task", changeLabel: "what you were trying to do" },
    { term: "What got in the way", value: list(barrierLabels), page: "what-happened", focus: "barrier-keyboard", changeLabel: "what got in the way" },
    { term: "In your words", value: text(happened?.details), page: "what-happened", focus: "details", changeLabel: "your description" },
    { term: "When", value: formatDate(happened?.date) || NOT_ANSWERED, page: "what-happened", focus: "date-month", changeLabel: "when it happened" },
    { term: "Page or document", value: text(happened?.page), page: "what-happened", focus: "page", changeLabel: "page or document" },
    {
      term: "What you're asking for",
      value: list(OUTCOMES.filter((o) => need?.outcomes.includes(o.id)).map((o) => o.label)),
      page: "what-you-need",
      focus: "outcome-fix",
      changeLabel: "what you're asking for",
    },
    {
      term: "Needed by",
      value: need?.hasDeadline === "yes" ? formatDate(need.deadline) : "No date",
      page: "what-you-need",
      focus: "hasDeadline-yes",
      changeLabel: "the date you need this by",
    },
    {
      term: "Technology",
      value: list(
        [...TECH.filter((t) => need?.tech.includes(t.id)).map((t) => t.label), need?.techDetails.trim() ?? ""].filter(Boolean),
      ),
      page: "what-you-need",
      focus: "tech-screen-reader",
      changeLabel: "technology",
    },
    { term: "How to reach you", value: list(contact), page: "what-you-need", focus: "contact-name", changeLabel: "contact details" },
  ];
}

function view(answers: Answers, nav: Nav, complaint: string, includeTechnical: boolean): SafeHtml {
  const days = daysSinceIncident(answers, new Date());
  return html`
    ${stepIndicator("review")}
    <p class="measure-4">Check your answers. You can change anything before you send it.</p>

    ${days !== null && days > LATE_WARNING_DAYS
      ? html`<div class="usa-alert usa-alert--warning page-block">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              Some agencies ask that complaints be filed within 180 days. Send yours as soon as you can, and keep the date
              it happened.
            </p>
          </div>
        </div>`
      : ""}

    <dl class="review-list">
      ${reviewRows(answers).map(
        (row) => html`
          <div class="review-list__row">
            <dt>${row.term}</dt>
            <dd class="review-list__value">${row.value}</dd>
            <dd class="review-list__action">
              <a class="usa-link" href="${nav.href(row.page, { from: "review", focus: row.focus })}"
                >Change<span class="usa-sr-only"> ${row.changeLabel}</span></a
              >
            </dd>
          </div>
        `,
      )}
    </dl>

    <form id="review-form" class="usa-form usa-form--large step-form" novalidate>
      <div class="usa-checkbox">
        <input
          class="usa-checkbox__input"
          id="include-technical"
          type="checkbox"
          name="includeTechnical"
          aria-describedby="include-technical-hint"
          ${includeTechnical ? html`checked` : ""}
        />
        <label class="usa-checkbox__label" for="include-technical">
          Include technical references for the agency's accessibility team
          <span class="usa-checkbox__label-description" id="include-technical-hint">
            Adds a short list of possibly related accessibility standards at the end. You don't need to understand them.
          </span>
        </label>
      </div>

      <section class="page-section" aria-labelledby="preview-heading">
        <h2 id="preview-heading">Preview</h2>
        <div class="complaint-preview" id="complaint-preview">${complaint}</div>
      </section>

      ${formActions("Continue to send", nav.href("what-you-need"))}
    </form>
  `;
}

export function showReview(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  const answers = loadAnswers();
  if (!answers.where?.agencyKey || !answers.whatHappened || !answers.whatYouNeed) {
    nav.go(!answers.where?.agencyKey ? "where" : !answers.whatHappened ? "what-happened" : "what-you-need");
    return;
  }
  const plan = planSend(answers, new Date());
  let includeTechnical = answers.includeTechnical ?? true;
  const complaintText = () => buildComplaint(loadAnswers(), plan.context, includeTechnical);

  document.title = stepDocumentTitle("review");
  mount(main, view(answers, nav, complaintText(), includeTechnical));

  const form = main.querySelector<HTMLFormElement>("#review-form");
  const preview = main.querySelector<HTMLElement>("#complaint-preview");
  form?.querySelector<HTMLInputElement>("#include-technical")?.addEventListener("change", (event) => {
    includeTechnical = (event.target as HTMLInputElement).checked;
    updateAnswers((d) => (d.includeTechnical = includeTechnical));
    if (preview) preview.textContent = complaintText();
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    nav.go("send");
  });
  options.focus();
}
