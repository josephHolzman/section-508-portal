/**
 * Step 3, "What do you need?": the outcome, an optional deadline, optional
 * assistive technology, and a way to reply. Disability details are never
 * required, and each optional question says why it helps.
 */

import { describedBy, errorMessage, errorSummary, memorableDate, readMemorableDate, stepIndicator } from "../lib/components";
import { formActions, radioGroup, requiredMark, runFormPage } from "../lib/form";
import { html, type SafeHtml } from "../lib/html";
import {
  emptyWhatYouNeed,
  loadAnswers,
  updateAnswers,
  type AssistiveTechId,
  type OutcomeId,
  type WhatYouNeedAnswers,
} from "../lib/state";
import { validateWhatYouNeed, type FieldError } from "../lib/validate";
import type { Nav, ShowOptions } from "../router";
import { stepDocumentTitle } from "./steps";

export const OUTCOMES: { id: OutcomeId; label: string }[] = [
  { id: "fix", label: "Fix the barrier" },
  { id: "accessible-version", label: "Give me an accessible version of a document" },
  { id: "another-way", label: "Help me finish this task another way" },
  { id: "reply-in-writing", label: "Reply to me in writing" },
];

export const TECH: { id: AssistiveTechId; label: string }[] = [
  { id: "screen-reader", label: "Screen reader" },
  { id: "magnifier", label: "Screen magnifier or zoom" },
  { id: "voice", label: "Voice control" },
  { id: "switch", label: "Switch device" },
  { id: "captions", label: "Captions" },
  { id: "keyboard", label: "Keyboard only" },
  { id: "other", label: "Something else" },
];

function checkboxList<T extends string>(name: string, idPrefix: string, items: { id: T; label: string }[], selected: T[]) {
  return items.map(
    (item) => html`
      <div class="usa-checkbox">
        <input
          class="usa-checkbox__input"
          id="${idPrefix}-${item.id}"
          type="checkbox"
          name="${name}"
          value="${item.id}"
          ${selected.includes(item.id) ? html`checked` : ""}
        />
        <label class="usa-checkbox__label" for="${idPrefix}-${item.id}">${item.label}</label>
      </div>
    `,
  );
}

function textInput(opts: {
  id: string;
  name: string;
  label: SafeHtml | string;
  value: string;
  autocomplete: string;
  type?: string;
  error?: FieldError;
  invalid?: boolean;
}) {
  const invalid = Boolean(opts.error) || Boolean(opts.invalid);
  return html`
    <div class="usa-form-group ${opts.error ? "usa-form-group--error" : ""}">
      <label class="usa-label ${opts.error ? "usa-label--error" : ""}" for="${opts.id}">${opts.label}</label>
      ${errorMessage(`${opts.id}-error`, opts.error)}
      <input
        class="usa-input ${invalid ? "usa-input--error" : ""}"
        id="${opts.id}"
        name="${opts.name}"
        type="${opts.type ?? "text"}"
        autocomplete="${opts.autocomplete}"
        value="${opts.value}"
        ${opts.error ? html`aria-describedby="${opts.id}-error"` : ""}
        ${invalid ? html`aria-invalid="true"` : ""}
      />
    </div>
  `;
}

function view(values: WhatYouNeedAnswers, errors: FieldError[], backHref: string): SafeHtml {
  const err = (key: string) => errors.find((e) => e.key === key);
  const outcomesErr = err("outcomes");
  const contactErr = err("contact");

  return html`
    ${stepIndicator("what-you-need")}
    ${errorSummary(errors)}
    <form class="usa-form usa-form--large step-form" id="what-you-need-form" novalidate>
      <p class="usa-hint margin-top-0">A red asterisk (<span class="required-mark">*</span>) marks a required question.</p>

      <div class="usa-form-group ${outcomesErr ? "usa-form-group--error" : ""}">
        <fieldset class="usa-fieldset" aria-describedby="${describedBy(outcomesErr && "outcomes-error", "outcomes-hint")}">
          <legend class="usa-legend">
            What do you want to happen? ${requiredMark()}<span class="usa-sr-only"> (required)</span>
          </legend>
          <span class="usa-hint" id="outcomes-hint">Select all that apply.</span>
          ${errorMessage("outcomes-error", outcomesErr)}
          ${checkboxList("outcomes", "outcome", OUTCOMES, values.outcomes)}
        </fieldset>
      </div>

      ${radioGroup({
        name: "hasDeadline",
        legend: "Do you need this resolved by a certain date?",
        hint: "If you do, we'll suggest calling the agency first.",
        value: values.hasDeadline,
        options: [
          {
            value: "yes",
            label: "Yes",
            reveal: memorableDate({
              prefix: "deadline",
              legend: "By what date?",
              hint: "The date you need to finish your task.",
              value: values.deadline,
              error: err("deadline"),
            }),
          },
          { value: "no", label: "No" },
        ],
      })}

      <div class="usa-form-group">
        <fieldset class="usa-fieldset" aria-describedby="tech-hint">
          <legend class="usa-legend">
            What assistive technology were you using? <span class="optional">(optional)</span>
          </legend>
          <span class="usa-hint" id="tech-hint">
            This helps the agency reproduce the problem. Skip it if you'd rather not say.
          </span>
          ${checkboxList("tech", "tech", TECH, values.tech)}
        </fieldset>
        <div class="usa-form-group">
          <label class="usa-label" for="tech-details">
            Which one, and which browser? <span class="optional">(optional)</span>
          </label>
          <span class="usa-hint" id="tech-details-hint">For example: NVDA with Firefox on Windows.</span>
          <input
            class="usa-input"
            id="tech-details"
            name="techDetails"
            type="text"
            autocomplete="off"
            aria-describedby="tech-details-hint"
            value="${values.techDetails}"
          />
        </div>
      </div>

      <div class="usa-form-group ${contactErr ? "usa-form-group--error" : ""}">
        <fieldset class="usa-fieldset" aria-describedby="${describedBy(contactErr && "contact-error", "contact-hint")}">
          <legend class="usa-legend usa-legend--large">
            How should they reach you? ${requiredMark()}<span class="usa-sr-only"> (required)</span>
          </legend>
          <span class="usa-hint" id="contact-hint">
            Agencies need a way to reply. Give your name and at least one way to reach you. This stays in your browser.
          </span>
          ${errorMessage("contact-error", contactErr)}
          ${textInput({
            id: "contact-name",
            name: "name",
            label: html`Name ${requiredMark()}`,
            value: values.name,
            autocomplete: "name",
            error: err("name"),
          })}
          ${textInput({
            id: "contact-email",
            name: "email",
            label: "Email",
            type: "email",
            value: values.email,
            autocomplete: "email",
            error: err("email"),
            invalid: Boolean(contactErr),
          })}
          ${textInput({
            id: "contact-phone",
            name: "phone",
            label: "Phone",
            type: "tel",
            value: values.phone,
            autocomplete: "tel",
            invalid: Boolean(contactErr),
          })}
          <div class="usa-form-group">
            <label class="usa-label" for="contact-address">Mailing address</label>
            <textarea
              class="usa-textarea usa-textarea--short ${contactErr ? "usa-input--error" : ""}"
              id="contact-address"
              name="address"
              rows="3"
              autocomplete="street-address"
              ${contactErr ? html`aria-invalid="true"` : ""}
            >${values.address}</textarea>
          </div>
        </fieldset>
      </div>

      ${formActions("Continue", backHref)}
    </form>
  `;
}

function readForm(form: HTMLFormElement, previous: WhatYouNeedAnswers): WhatYouNeedAnswers {
  const data = new FormData(form);
  const str = (name: string) => String(data.get(name) ?? "");
  const outcomeIds = new Set(OUTCOMES.map((o) => o.id));
  const techIds = new Set(TECH.map((t) => t.id));
  return {
    ...previous,
    outcomes: data.getAll("outcomes").map(String).filter((v): v is OutcomeId => outcomeIds.has(v as OutcomeId)),
    hasDeadline: (data.get("hasDeadline") as "yes" | "no" | null) ?? undefined,
    deadline: readMemorableDate(data, "deadline"),
    tech: data.getAll("tech").map(String).filter((v): v is AssistiveTechId => techIds.has(v as AssistiveTechId)),
    techDetails: str("techDetails"),
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    address: str("address"),
  };
}

export function showWhatYouNeed(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  let values = loadAnswers().whatYouNeed ?? emptyWhatYouNeed();
  const fromReview = options.params.get("from") === "review";

  runFormPage({
    main,
    options,
    formId: "what-you-need-form",
    title: (hasErrors) => stepDocumentTitle("what-you-need", hasErrors),
    render: (errors) => view(values, errors, fromReview ? nav.href("review") : nav.href("what-happened")),
    persist: (form) => {
      values = readForm(form, values);
      updateAnswers((d) => (d.whatYouNeed = values));
    },
    validate: () => validateWhatYouNeed(values, new Date()),
    onValid: () => nav.go("review"),
  });
}
