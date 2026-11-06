/** Behavior shared by every step's form. */

import { html, mount, type SafeHtml } from "./html";
import type { FieldError } from "./validate";
import { describedBy, errorMessage } from "./components";
import type { ShowOptions } from "../router";

/**
 * Render a step's form and run its loop: persist on every change, validate
 * on submit, and on failure re-render with errors and focus the summary.
 */
export function runFormPage(args: {
  main: HTMLElement;
  options: ShowOptions;
  formId: string;
  title: (hasErrors: boolean) => string;
  render: (errors: FieldError[]) => SafeHtml;
  /** Read the form into state. Called on every input and before validating. */
  persist: (form: HTMLFormElement) => void;
  validate: () => FieldError[];
  onValid: () => void;
  /** Extra wiring after each render (reveals are wired already). */
  wire?: (form: HTMLFormElement) => void;
}): void {
  const draw = (errors: FieldError[]) => {
    document.title = args.title(errors.length > 0);
    mount(args.main, args.render(errors));
    wireErrorSummary(args.main);
    const form = args.main.querySelector<HTMLFormElement>(`#${args.formId}`);
    if (!form) return;
    wireReveals(form);
    form.addEventListener("input", () => args.persist(form));
    form.addEventListener("change", () => args.persist(form));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      args.persist(form);
      const errs = args.validate();
      if (errs.length > 0) {
        draw(errs);
        args.main.querySelector<HTMLElement>("#error-summary")?.focus();
        return;
      }
      args.onValid();
    });
    args.wire?.(form);
  };
  draw([]);
  args.options.focus(args.options.params.get("focus"));
}

/** Move focus to a field, keeping its label or legend in view. */
export function focusField(targetId: string): void {
  const field = document.getElementById(targetId);
  if (!field) return;
  const group = field.closest("fieldset") ?? field.closest(".usa-form-group") ?? field;
  group.scrollIntoView({ block: "start" });
  field.focus({ preventScroll: true });
}

/** Error summary links move focus to their field instead of jumping by fragment. */
export function wireErrorSummary(root: HTMLElement): void {
  root.querySelectorAll<HTMLAnchorElement>("[data-error-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusField(link.dataset.errorTarget ?? "");
    });
  });
}

/**
 * Conditional reveals: a control with data-reveals="<id>" shows that element
 * while it is checked. Focus stays put; the revealed field is next in the
 * tab order, so no announcement is needed.
 */
export function wireReveals(form: HTMLFormElement): void {
  const sync = () => {
    form.querySelectorAll<HTMLInputElement>("input[data-reveals]").forEach((input) => {
      const target = document.getElementById(input.dataset.reveals ?? "");
      if (target) target.hidden = !input.checked;
    });
  };
  form.addEventListener("change", sync);
  sync();
}

export function requiredMark(): SafeHtml {
  return html`<span class="required-mark" aria-hidden="true">*</span>`;
}

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  /** Markup shown directly below this option while it is selected. */
  reveal?: SafeHtml;
}

/** A USWDS radio fieldset with an optional hint, error, and conditional reveals. */
export function radioGroup(opts: {
  name: string;
  legend: string;
  required?: boolean;
  hint?: string;
  value: string | undefined;
  options: RadioOption[];
  error?: FieldError;
  legendClass?: string;
}): SafeHtml {
  const hintId = opts.hint ? `${opts.name}-hint` : undefined;
  const errorId = opts.error ? `${opts.name}-error` : undefined;
  return html`
    <div class="usa-form-group ${opts.error ? "usa-form-group--error" : ""}">
      <fieldset class="usa-fieldset" ${hintId || errorId ? html`aria-describedby="${describedBy(errorId, hintId)}"` : ""}>
        <legend class="usa-legend ${opts.legendClass ?? ""}">
          ${opts.legend}
          ${opts.required ? html`${requiredMark()}<span class="usa-sr-only"> (required)</span>` : html`<span class="optional">(optional)</span>`}
        </legend>
        ${opts.hint ? html`<span class="usa-hint" id="${hintId}">${opts.hint}</span>` : ""}
        ${errorMessage(errorId ?? "", opts.error)}
        ${opts.options.map((o) => {
          const id = `${opts.name}-${o.value}`;
          const revealId = o.reveal ? `${id}-reveal` : undefined;
          return html`
            <div class="usa-radio">
              <input
                class="usa-radio__input"
                id="${id}"
                type="radio"
                name="${opts.name}"
                value="${o.value}"
                ${opts.value === o.value ? html`checked` : ""}
                ${revealId ? html`data-reveals="${revealId}" aria-controls="${revealId}"` : ""}
              />
              <label class="usa-radio__label" for="${id}">
                ${o.label}
                ${o.description ? html`<span class="usa-checkbox__label-description">${o.description}</span>` : ""}
              </label>
            </div>
            ${o.reveal
              ? html`<div class="conditional-field" id="${revealId}" ${opts.value === o.value ? "" : html`hidden`}>${o.reveal}</div>`
              : ""}
          `;
        })}
      </fieldset>
    </div>
  `;
}

/**
 * Back and Continue, as USWDS's default button group shows them: Back is a
 * link (it navigates) styled as an outline button, then the form's submit
 * button. Source order is visual order at every width, so focus order never
 * contradicts what people see (WCAG 2.4.3); on phones the group stacks.
 */
export function formActions(submitLabel: string, backHref: string): SafeHtml {
  return html`
    <ul class="usa-button-group form-actions">
      <li class="usa-button-group__item">
        <a class="usa-button usa-button--outline" href="${backHref}">Back</a>
      </li>
      <li class="usa-button-group__item"><button type="submit" class="usa-button">${submitLabel}</button></li>
    </ul>
  `;
}
