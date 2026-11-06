/**
 * Step 1, part 1: "Where did it happen?" A website (paste the link), an app,
 * a document, or a system at work. The link is matched to an agency on the
 * next screen, where the person confirms it.
 */

import { resolveLink } from "../data/directory";
import { errorMessage, errorSummary, describedBy, stepIndicator } from "../lib/components";
import { radioGroup, requiredMark, formActions, runFormPage } from "../lib/form";
import { html } from "../lib/html";
import { loadAnswers, updateAnswers, type WhereAnswers, type WhereKind } from "../lib/state";
import type { FieldError } from "../lib/validate";
import type { Nav, ShowOptions } from "../router";
import { stepDocumentTitle } from "./steps";

const KINDS: { value: WhereKind; label: string }[] = [
  { value: "link", label: "A website" },
  { value: "app", label: "A mobile app" },
  { value: "document", label: "A document, like a PDF or a letter" },
  { value: "work", label: "A system I use at work as a federal employee" },
];

export function validateWhere(values: WhereAnswers): FieldError[] {
  if (!values.kind) {
    return [{ key: "kind", targetId: "kind-link", message: "Choose what you had trouble with" }];
  }
  if (values.kind === "link") {
    const url = values.url?.trim() ?? "";
    if (!url) return [{ key: "url", targetId: "link", message: "Paste the link to the page" }];
    if (resolveLink(url).status === "not-a-link") {
      return [
        {
          key: "url",
          targetId: "link",
          message: "Enter the page's address, like www.ssa.gov/apply. If you don't have one, choose another option",
        },
      ];
    }
  }
  return [];
}

function linkField(url: string, error: FieldError | undefined) {
  return html`
    <div class="usa-form-group ${error ? "usa-form-group--error" : ""}">
      <label class="usa-label ${error ? "usa-label--error" : ""}" for="link">
        Paste the link to the page ${requiredMark()}
      </label>
      <span class="usa-hint" id="link-hint">Copy it from your browser's address bar. For example: www.ssa.gov/apply</span>
      ${errorMessage("link-error", error)}
      <input
        class="usa-input ${error ? "usa-input--error" : ""}"
        id="link"
        name="url"
        type="text"
        inputmode="url"
        autocomplete="off"
        spellcheck="false"
        aria-describedby="${describedBy(error && "link-error", "link-hint")}"
        ${error ? html`aria-invalid="true"` : ""}
        value="${url}"
      />
    </div>
  `;
}

export function showWhere(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  let values: WhereAnswers = loadAnswers().where ?? {};
  const fromReview = options.params.get("from") === "review";

  runFormPage({
    main,
    options,
    formId: "where-form",
    title: (hasErrors) => stepDocumentTitle("where", hasErrors),
    render: (errors) => {
      const kindError = errors.find((e) => e.targetId === "kind-link");
      const linkError = errors.find((e) => e.targetId === "link");
      return html`
        ${stepIndicator("where")}
        ${errorSummary(errors)}
        <form class="usa-form usa-form--large step-form" id="where-form" novalidate>
          <p class="usa-hint margin-top-0">A red asterisk (<span class="required-mark">*</span>) marks a required question.</p>
          ${radioGroup({
            name: "kind",
            legend: "What did you have trouble with?",
            required: true,
            value: values.kind,
            error: kindError,
            options: KINDS.map((k) =>
              k.value === "link" ? { ...k, reveal: linkField(values.url ?? "", linkError) } : k,
            ),
          })}
          ${formActions("Continue", fromReview ? nav.href("review") : nav.href("start"))}
        </form>
      `;
    },
    persist: (form) => {
      const data = new FormData(form);
      const kind = (data.get("kind") as WhereKind | null) ?? undefined;
      values = { ...values, kind, url: String(data.get("url") ?? "") };
      updateAnswers((d) => (d.where = { ...d.where, kind: values.kind, url: values.url }));
    },
    validate: () => validateWhere(values),
    onValid: () => {
      updateAnswers((d) => {
        const previous = d.where ?? {};
        const next: WhereAnswers = { kind: values.kind };
        if (values.kind === "link") {
          const url = values.url?.trim() ?? "";
          const result = resolveLink(url);
          next.url = url;
          if (result.status === "match") {
            Object.assign(next, { host: result.host, match: "match", matchedKey: result.agency.key });
          } else if (result.status === "no-match") {
            Object.assign(next, { host: result.host, match: "no-match" });
          }
        }
        // Keep the earlier confirmation only if the lookup came out the same.
        const sameMatch = previous.kind === next.kind && previous.matchedKey === next.matchedKey && previous.match === next.match;
        if (sameMatch) {
          Object.assign(next, {
            confirm: previous.confirm,
            chosenKey: previous.chosenKey,
            agencyKey: previous.agencyKey,
            agencyName: previous.agencyName,
            agencyId: previous.agencyId,
          });
        }
        // Step 2's "Which page?" was prefilled from the old link: follow the new one.
        if (d.whatHappened && d.whatHappened.page === (previous.url ?? "")) {
          d.whatHappened.page = next.url ?? "";
        }
        d.where = next;
      });
      nav.go("agency", fromReview ? { from: "review" } : {});
    },
  });
}
