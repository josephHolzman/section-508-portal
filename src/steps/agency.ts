/**
 * Step 1, part 2: confirm the responsible agency.
 *
 * Three variants on one screen:
 * - the link matched an agency: "Is this the right agency?"
 * - the link matched nothing: choose from the list, or it's a state or local site
 * - an app, document, or work system: choose from the list
 * The no-match path stays gentle: the index covers .gov and .mil sites only,
 * so a miss is usually the list's gap, not the person's mistake.
 */

import {
  agencyByKey,
  agencyOptions,
  coverageOf,
  entryById,
  isVerified,
  type AgencyRef,
} from "../data/directory";
import { describedBy, errorMessage, errorSummary, stepIndicator } from "../lib/components";
import { formActions, radioGroup, requiredMark, runFormPage } from "../lib/form";
import { html, mount, type SafeHtml } from "../lib/html";
import { loadAnswers, updateAnswers, type WhereAnswers } from "../lib/state";
import type { FieldError } from "../lib/validate";
import type { Nav, ShowOptions } from "../router";
import { stepDocumentTitle } from "./steps";

type Variant = "matched" | "no-match" | "pick";

function variantOf(where: WhereAnswers): Variant {
  if (where.kind === "link" && where.match === "match" && agencyByKey(where.matchedKey)) return "matched";
  if (where.kind === "link") return "no-match";
  return "pick";
}

const TITLES: Record<Variant, string> = {
  matched: "Is this the right agency?",
  "no-match": "Which agency runs this website?",
  pick: "Which agency is responsible?",
};

export function validateAgency(where: WhereAnswers): FieldError[] {
  const variant = variantOf(where);
  const needsChoice = { key: "chosenKey", targetId: "agency-select", message: "Choose the agency from the list" };
  if (variant === "pick") return where.chosenKey ? [] : [needsChoice];
  if (!where.confirm) {
    return variant === "matched"
      ? [{ key: "confirm", targetId: "confirm-yes", message: "Choose whether this is the right agency" }]
      : [{ key: "confirm", targetId: "confirm-other", message: "Choose the agency, or say it's a state or local website" }];
  }
  if (where.confirm === "other" && !where.chosenKey) return [needsChoice];
  return [];
}

/** The agency the person ends up with, or null for the state or local exit. */
export function confirmedAgency(where: WhereAnswers): AgencyRef | null {
  const variant = variantOf(where);
  if (variant !== "pick" && where.confirm === "state-local") return null;
  if (variant === "matched" && where.confirm === "yes") return agencyByKey(where.matchedKey) ?? null;
  return agencyByKey(where.chosenKey) ?? null;
}

function agencySelect(chosenKey: string | undefined, error: FieldError | undefined, label = "Agency"): SafeHtml {
  return html`
    <div class="usa-form-group ${error ? "usa-form-group--error" : ""}">
      <label class="usa-label ${error ? "usa-label--error" : ""}" for="agency-select">${label} ${requiredMark()}</label>
      <span class="usa-hint" id="agency-select-hint">
        Listed by name. Some offices, like the IRS, are listed on their own.
      </span>
      ${errorMessage("agency-select-error", error)}
      <select
        class="usa-select ${error ? "usa-input--error" : ""}"
        id="agency-select"
        name="chosenKey"
        aria-describedby="${describedBy(error && "agency-select-error", "agency-select-hint")}"
        ${error ? html`aria-invalid="true"` : ""}
      >
        <option value="">- Select -</option>
        ${agencyOptions().map(
          (a) => html`<option value="${a.key}" ${a.key === chosenKey ? html`selected` : ""}>${a.name}</option>`,
        )}
      </select>
    </div>
  `;
}

/**
 * Section 508 covers executive-branch agencies (44 U.S.C. 3502(1), via the
 * Access Board's definition). Congress, the courts, GAO and the FEC aren't
 * covered, though several follow it voluntarily. Say so plainly, without
 * stopping the person: the office may still act on the complaint.
 */
export function coverageNotice(ref: AgencyRef | undefined): SafeHtml {
  if (!ref || coverageOf(ref) !== "not-covered") return html``;
  return html`
    <div class="usa-alert usa-alert--warning usa-alert--slim page-block">
      <div class="usa-alert__body">
        <p class="usa-alert__text">
          Section 508 may not apply to the ${ref.name}. The law covers executive branch agencies, and a few offices,
          like Congress and the federal courts, aren't included. Some follow it anyway. You can still write your
          complaint and send it to the office's accessibility contact.
        </p>
      </div>
    </div>
  `;
}

/** Spec state 4: an agency whose complaint channel we haven't checked yet. */
function unverifiedNotice(ref: AgencyRef | undefined): SafeHtml {
  if (!ref || coverageOf(ref) === "not-covered") return html``;
  const entry = entryById(ref.entryId);
  if (entry && isVerified(entry)) return html``;
  return html`
    <div class="usa-alert usa-alert--info usa-alert--slim page-block">
      <div class="usa-alert__body">
        <p class="usa-alert__text">
          We haven't checked how the ${ref.name} takes complaints yet. You can still write your complaint, and we'll show
          you who to send it to.
        </p>
      </div>
    </div>
  `;
}

const WORK_NOTE = html`
  <div class="usa-summary-box page-block" role="region" aria-labelledby="work-note-heading">
    <div class="usa-summary-box__body">
      <h2 class="usa-summary-box__heading" id="work-note-heading">If this affects your job</h2>
      <div class="usa-summary-box__text">
        <p class="margin-0">
          This tool writes a Section 508 complaint. If the barrier affects your job, you may also be able to ask for a
          reasonable accommodation. Your agency's Section 508 program manager can explain your options.
        </p>
      </div>
    </div>
  </div>
`;

function view(where: WhereAnswers, errors: FieldError[], nav: Nav, backHref: string): SafeHtml {
  const variant = variantOf(where);
  const confirmError = errors.find((e) => e.key === "confirm");
  const chooseError = errors.find((e) => e.key === "chosenKey");
  const matched = agencyByKey(where.matchedKey);

  let body: SafeHtml;
  if (variant === "matched" && matched) {
    body = html`
      <div class="agency-card page-block">
        <p class="agency-card__intro">This website belongs to</p>
        <p class="agency-card__name">${matched.name}</p>
        <p class="agency-card__host">${where.host ?? ""}</p>
      </div>
      ${coverageNotice(matched)} ${unverifiedNotice(matched)}
      ${radioGroup({
        name: "confirm",
        legend: "Is this correct?",
        required: true,
        value: where.confirm,
        error: confirmError,
        options: [
          { value: "yes", label: "Yes" },
          { value: "other", label: "No, choose another agency", reveal: agencySelect(where.chosenKey, chooseError) },
          { value: "state-local", label: "It's a state or local government website" },
        ],
      })}
      <p class="usa-hint">We matched the address using the U.S. General Services Administration's public list of federal websites.</p>
    `;
  } else if (variant === "no-match") {
    body = html`
      <p>
        We couldn't match <strong>${where.host ?? "this address"}</strong> to a federal agency. GSA's list of federal
        websites doesn't include every site, so you can choose the agency yourself.
      </p>
      ${radioGroup({
        name: "confirm",
        legend: "Who runs this website?",
        required: true,
        value: where.confirm,
        error: confirmError,
        options: [
          { value: "other", label: "Choose the agency from a list", reveal: agencySelect(where.chosenKey, chooseError) },
          { value: "state-local", label: "It's a state or local government website" },
        ],
      })}
    `;
  } else {
    body = html`
      ${where.kind === "work" ? WORK_NOTE : ""}
      ${agencySelect(where.chosenKey, chooseError, where.kind === "work" ? "Which agency do you work for?" : "Agency")}
      ${where.kind !== "work"
        ? html`<p><a class="usa-link" href="${nav.href("state-local")}">It's from a state or local government</a></p>`
        : ""}
      ${coverageNotice(agencyByKey(where.chosenKey))} ${unverifiedNotice(agencyByKey(where.chosenKey))}
    `;
  }

  return html`
    ${stepIndicator("where", TITLES[variant])}
    ${errorSummary(errors)}
    <form class="usa-form usa-form--large step-form" id="agency-form" novalidate>
      ${body}
      ${formActions("Continue", backHref)}
    </form>
  `;
}

export function showAgency(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  let where: WhereAnswers = loadAnswers().where ?? {};
  if (!where.kind) {
    nav.go("where");
    return;
  }
  const fromReview = options.params.get("from") === "review";
  const variant = variantOf(where);

  runFormPage({
    main,
    options,
    formId: "agency-form",
    title: (hasErrors) => stepDocumentTitle("where", hasErrors, TITLES[variant]),
    render: (errors) => view(where, errors, nav, nav.href("where", fromReview ? { from: "review" } : {})),
    persist: (form) => {
      const data = new FormData(form);
      const confirm = (data.get("confirm") as WhereAnswers["confirm"] | null) ?? undefined;
      const chosenKey = String(data.get("chosenKey") ?? "") || undefined;
      where = { ...where, confirm, chosenKey };
      updateAnswers((d) => (d.where = where));
    },
    validate: () => validateAgency(where),
    onValid: () => {
      const agency = confirmedAgency(where);
      if (!agency) {
        nav.go("state-local");
        return;
      }
      updateAnswers((d) => {
        d.where = { ...where, agencyKey: agency.key, agencyName: agency.name, agencyId: agency.entryId };
      });
      nav.go(fromReview ? "review" : "what-happened");
    },
  });
}

export function showStateLocal(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  document.title = "This looks like a state or local government site – Barrier Report";
  mount(
    main,
    html`
    <h1 id="page-heading" tabindex="-1">This looks like a state or local government site</h1>
    <p class="usa-intro measure-4">
      Section 508 covers federal agencies. State and local governments are covered by the Americans with Disabilities Act
      (ADA) instead, so this tool can't write this complaint.
    </p>
    <h2>What you can do</h2>
    <ul class="usa-list">
      <li>Contact the site's own accessibility office. Look for an "Accessibility" link at the bottom of its pages.</li>
      <li>
        <a class="usa-link" href="https://www.ada.gov/file-a-complaint/"
          >File an ADA complaint with the U.S. Department of Justice<span class="usa-sr-only"> (ada.gov)</span></a
        >
      </li>
    </ul>
    <p class="form-actions"><a class="usa-button" href="${nav.href("agency")}">Go back and choose a federal agency</a></p>
    <p class="usa-hint">Your answers are still here if you go back.</p>
  `,
  );
  options.focus();
}
