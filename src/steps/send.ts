/**
 * Step 5, "Send your complaint": the person sends it themselves, through the
 * agency's own channel. Copy, open in an email app, download, or print. The
 * tool submits nothing.
 */

import type { Channel } from "../data/directory";
import { agencyByKey } from "../data/directory";
import { stepIndicator } from "../lib/components";
import { coverageNotice } from "./agency";
import { buildComplaint, complaintSubject, formatDate } from "../lib/complaint";
import { clearAnswersDialog, wireClearAnswersDialog } from "../lib/dialog";
import { html, mount, type SafeHtml } from "../lib/html";
import { needsSignature, planSend, type SendPlan } from "../lib/routing";
import { clearAnswers, loadAnswers, updateAnswers, type Answers } from "../lib/state";
import type { Nav, ShowOptions } from "../router";
import { stepDocumentTitle } from "./steps";

/** Long mailto: links fail in some email apps; above this, offer copy only. */
export const MAILTO_LIMIT = 1800;

const PM_LISTING = "https://www.section508.gov/tools/program-manager-listing/";

export function mailtoHref(address: string, subject: string, body: string): string {
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function formatChecked(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function sourceLink(url: string, label: string): SafeHtml {
  return html`<a class="usa-link" href="${url}" target="_blank" rel="noopener noreferrer"
    >${label}<span class="usa-sr-only"> (opens in a new tab)</span></a
  >`;
}

function quote(channel: Channel): SafeHtml {
  if (!channel.instructionsQuote) return html``;
  return html`<p class="channel-quote">
    The agency's page says: “${channel.instructionsQuote}” ${sourceLink(channel.source, "Source")}
  </p>`;
}

const screenshotStep = (h: (text: string) => SafeHtml) => html`<li class="usa-process-list__item">
  ${h("Attach your screenshot, if you took one")}
  <p>Cover or crop any personal information first.</p>
</li>`;

function steps(channel: Channel, subject: string, level: 3 | 4 = 3): SafeHtml {
  const h = (text: SafeHtml | string) => html`<h${level} class="usa-process-list__heading">${text}</h${level}>`;
  switch (channel.type) {
    case "email":
      return html`<ol class="usa-process-list">
        <li class="usa-process-list__item">
          ${h("Copy your complaint")}
          <p>Use the Copy complaint button above.</p>
        </li>
        <li class="usa-process-list__item">
          ${h(html`Email it to ${channel.address ?? ""}`)}
          <p>Paste it into a new email. Use this subject line: ${subject}</p>
        </li>
        ${screenshotStep(h)}
        <li class="usa-process-list__item">
          ${h("Keep a copy")}
          <p>Save the email you sent and note the date.</p>
        </li>
      </ol>`;
    case "webform":
    case "portal":
      return html`<ol class="usa-process-list">
        <li class="usa-process-list__item">
          ${h("Copy your complaint")}
          <p>Use the Copy complaint button above.</p>
        </li>
        <li class="usa-process-list__item">
          ${h("Open the agency's form")}
          <p>${channel.url ? sourceLink(channel.url, "Open the complaint form") : ""}</p>
        </li>
        <li class="usa-process-list__item">
          ${h("Paste each part where the form asks for it")}
          <p>Most forms ask for what happened, where, and how to reach you.</p>
        </li>
        <li class="usa-process-list__item">
          ${h("Keep a copy")}
          <p>Download your complaint and note the date you sent it.</p>
        </li>
      </ol>`;
    case "mail":
      return html`<ol class="usa-process-list">
        <li class="usa-process-list__item">
          ${h("Print or download your complaint")}
          <p>Use the Print or Download button above.</p>
        </li>
        ${needsSignature(channel)
          ? html`<li class="usa-process-list__item">
              ${h("Sign it")}
              <p>The agency asks for a signed complaint.</p>
            </li>`
          : ""}
        <li class="usa-process-list__item">
          ${h("Mail it")}
          <address class="mail-address">${channel.address ?? ""}</address>
        </li>
        <li class="usa-process-list__item">
          ${h("Keep a copy")}
          <p>Note the date you mailed it.</p>
        </li>
      </ol>`;
  }
}

const CHANNEL_LABEL: Record<Channel["type"], string> = {
  email: "By email",
  webform: "With the agency's online form",
  portal: "Through the agency's portal",
  mail: "By mail",
};

function channelSections(channels: Channel[], subject: string): SafeHtml {
  if (channels.length === 1) {
    const only = channels[0]!;
    return html`${quote(only)}${steps(only, subject)}`;
  }
  return html`
    <p>Choose one way to send it.</p>
    ${channels.map(
      (c) => html`<section class="page-block" aria-label="${CHANNEL_LABEL[c.type]}">
        <h3 class="font-heading-md">${CHANNEL_LABEL[c.type]}</h3>
        ${quote(c)} ${steps(c, subject, 4)}
      </section>`,
    )}
  `;
}

function howToSend(plan: SendPlan, subject: string): SafeHtml {
  const pmEmail = plan.programManagers.find((p) => p.email)?.email;
  const pmChannel = (email: string): Channel => ({
    type: "email",
    purpose: "complaint",
    address: email,
    url: null,
    instructionsQuote: null,
    source: PM_LISTING,
  });

  if (plan.verified && plan.complaintChannels.length > 0) {
    return channelSections(plan.complaintChannels, subject);
  }
  if (plan.verified && plan.feedbackChannels.length > 0) {
    return html`
      <p>The ${plan.agencyName} doesn't publish a separate address for formal complaints. Send it to its accessibility contact.</p>
      ${channelSections(plan.feedbackChannels.slice(0, 1), subject)}
    `;
  }
  if (pmEmail) {
    return html`
      <p>
        We haven't checked how the ${plan.agencyName} takes complaints, so send it to the agency's Section 508 program
        manager, listed by the U.S. General Services Administration.
      </p>
      ${steps(pmChannel(pmEmail), subject)}
      <p class="usa-hint">Contact from ${sourceLink(PM_LISTING, "GSA's Section 508 program manager listing")}.</p>
    `;
  }
  return html`
    <p>We don't have a contact for the ${plan.agencyName} yet. Two places to look:</p>
    <ul class="usa-list">
      <li>The agency's accessibility page. Look for an "Accessibility" link at the bottom of its website.</li>
      <li>${sourceLink(PM_LISTING, "GSA's list of Section 508 program managers")}, which names a contact for most agencies.</li>
    </ul>
  `;
}

function emailTarget(plan: SendPlan): string | undefined {
  const channels = plan.verified
    ? plan.complaintChannels.length > 0
      ? plan.complaintChannels
      : plan.feedbackChannels.slice(0, 1)
    : [];
  const email = channels.find((c) => c.type === "email")?.address;
  if (channels.length > 0) return email ?? undefined;
  return plan.programManagers.find((p) => p.email)?.email;
}

function view(answers: Answers, plan: SendPlan, nav: Nav, text: string, conflict: boolean): SafeHtml {
  const need = answers.whatYouNeed;
  const deadline = need?.hasDeadline === "yes" ? formatDate(need.deadline) : "";
  const subject = complaintSubject(answers);
  const title = `Send your complaint to the ${plan.context.recipient}`;
  const pm = plan.programManagers[0];

  return html`
    ${stepIndicator("send", title)}
    ${coverageNotice(agencyByKey(answers.where?.agencyKey))}

    ${deadline
      ? html`<div class="usa-alert usa-alert--info page-block">
          <div class="usa-alert__body">
            <h2 class="usa-alert__heading">Need this by ${deadline}?</h2>
            <p class="usa-alert__text">
              Don't wait for a reply.
              ${plan.phone
                ? html`Call the ${plan.agencyName} at ${plan.phone.number}`
                : html`Call the ${plan.agencyName}'s help line`}
              and ask for another way to finish your task. If you're deaf, hard of hearing, or have a speech disability,
              you can dial 711 to use a relay service.
            </p>
          </div>
        </div>`
      : ""}

    ${plan.draftData
      ? html`<div class="usa-alert usa-alert--warning page-block">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              <strong>Draft data.</strong> This agency's contact details haven't been checked by a person yet. Confirm
              them on the agency's accessibility page before you send.
            </p>
          </div>
        </div>`
      : ""}

    ${plan.stale && plan.lastChecked
      ? html`<div class="usa-alert usa-alert--warning page-block">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              We last checked this on ${formatChecked(plan.lastChecked)}. Confirm the details on the agency's
              accessibility page before you send.
            </p>
          </div>
        </div>`
      : ""}

    ${conflict
      ? html`<div class="usa-alert usa-alert--warning page-block" id="edit-conflict">
          <div class="usa-alert__body">
            <h2 class="usa-alert__heading">You changed your answers after editing your complaint</h2>
            <p class="usa-alert__text">Your edited complaint is below. You can keep it, or replace it with your updated answers.</p>
            <ul class="usa-button-group margin-top-2">
              <li class="usa-button-group__item"><button type="button" class="usa-button" id="keep-edits">Keep my edits</button></li>
              <li class="usa-button-group__item">
                <button type="button" class="usa-button usa-button--outline" id="replace-edits">Replace with updated answers</button>
              </li>
            </ul>
          </div>
        </div>`
      : ""}

    <div class="usa-form-group">
      <label class="usa-label" for="complaint">
        Your complaint <span class="optional">(you can edit it before sending)</span>
      </label>
      <textarea class="usa-textarea complaint-text" id="complaint" name="complaint" rows="18" spellcheck="true">${text}</textarea>
    </div>
    <ul class="usa-button-group margin-top-2">
      <li class="usa-button-group__item"><button type="button" class="usa-button" id="copy">Copy complaint</button></li>
      <li class="usa-button-group__item" id="mailto-item" hidden>
        <a class="usa-button usa-button--outline" id="mailto" href="#">Open in my email app</a>
      </li>
      <li class="usa-button-group__item">
        <button type="button" class="usa-button usa-button--outline" id="download">Download as text file</button>
      </li>
      <li class="usa-button-group__item"><button type="button" class="usa-button usa-button--outline" id="print">Print</button></li>
    </ul>
    <p class="send-status" id="send-status" role="status"></p>

    <section class="page-section" aria-labelledby="how-heading">
      <h2 id="how-heading">How to send it</h2>
      ${howToSend(plan, subject)}
      ${plan.verified && plan.lastChecked && plan.entry
        ? html`<p class="usa-hint">
            Checked ${formatChecked(plan.lastChecked)} from the ${plan.agencyName}'s
            ${sourceLink(plan.entry.statementUrl, "accessibility statement")}.
          </p>`
        : ""}
      ${plan.filingWindow
        ? html`<p>
            The agency's rules ask that complaints be filed within ${plan.filingWindow.days} days of the problem.
            ${sourceLink(plan.filingWindow.source, "Read the rule")}
          </p>`
        : ""}
    </section>

    ${plan.phone
      ? html`<section class="page-section" aria-labelledby="call-heading">
          <h2 id="call-heading">Prefer to call?</h2>
          <p>
            Call ${plan.phone.number} and say you want to report an accessibility barrier. If you're deaf, hard of hearing,
            or have a speech disability, dial 711 first to use a relay service.
          </p>
          <p class="usa-hint">The agency lists this number as: ${plan.phone.label}. ${sourceLink(plan.phone.source, "Source")}</p>
        </section>`
      : ""}

    <div class="usa-summary-box page-section" role="region" aria-labelledby="next-heading">
      <div class="usa-summary-box__body">
        <h2 class="usa-summary-box__heading" id="next-heading">What happens next</h2>
        <div class="usa-summary-box__text">
          <p>
            The agency handles your complaint under its own Section 504 procedures.
            ${pm
              ? html`If you don't hear back within 30 days, contact its Section 508 program manager: ${pm.name}, ${pm.email}.`
              : html`If you don't hear back within 30 days, contact its Section 508 program manager, listed at
                  ${sourceLink(PM_LISTING, "section508.gov")}.`}
          </p>
          <p class="margin-bottom-0">30 days is a suggested time to follow up, not a legal deadline.</p>
        </div>
      </div>
    </div>

    <ul class="usa-button-group form-actions">
      <li class="usa-button-group__item">
        <a class="usa-button usa-button--outline" href="${nav.href("review")}">Back</a>
      </li>
    </ul>

    <section class="clear-section" aria-labelledby="clear-heading">
      <h2 id="clear-heading" class="font-heading-md">Done?</h2>
      <p>Clear your answers from this browser tab. Make sure you've copied, downloaded, or printed your complaint first.</p>
      <button type="button" class="usa-button usa-button--outline" id="clear">Clear my answers</button>
    </section>

    ${clearAnswersDialog()}

    <div class="print-only" id="print-complaint"></div>
  `;
}

export function showSend(main: HTMLElement, nav: Nav, options: ShowOptions): void {
  const answers = loadAnswers();
  if (!answers.where?.agencyKey || !answers.whatHappened || !answers.whatYouNeed) {
    nav.go("review");
    return;
  }
  const plan = planSend(answers, new Date());
  const generated = buildComplaint(answers, plan.context, answers.includeTechnical ?? true);
  const edited = answers.edited;
  const conflict = Boolean(edited && edited.basedOn !== generated);
  const initial = edited ? edited.text : generated;

  document.title = stepDocumentTitle("send", false, `Send your complaint to the ${plan.context.recipient}`);
  mount(main, view(answers, plan, nav, initial, conflict));

  const $ = <T extends HTMLElement>(id: string) => main.querySelector<T>(`#${id}`);
  const textarea = $<HTMLTextAreaElement>("complaint")!;
  const status = $<HTMLElement>("send-status")!;
  const subject = complaintSubject(answers);

  const announce = (message: string) => {
    // Clear first so the same message is announced again on a repeat action.
    status.textContent = "";
    window.setTimeout(() => (status.textContent = message), 50);
  };

  const target = emailTarget(plan);
  const syncMailto = () => {
    const item = $<HTMLElement>("mailto-item");
    const link = $<HTMLAnchorElement>("mailto");
    if (!item || !link || !target) return;
    const body = textarea.value.replace(/^Subject:.*\n+/, "");
    const href = mailtoHref(target, subject, body);
    item.hidden = href.length > MAILTO_LIMIT;
    link.href = href;
  };
  syncMailto();

  textarea.addEventListener("input", () => {
    updateAnswers((d) => (d.edited = { text: textarea.value, basedOn: generated }));
    syncMailto();
  });

  $("keep-edits")?.addEventListener("click", () => {
    updateAnswers((d) => (d.edited = { text: textarea.value, basedOn: generated }));
    $("edit-conflict")?.remove();
    textarea.focus();
    announce("Kept your edits.");
  });
  $("replace-edits")?.addEventListener("click", () => {
    updateAnswers((d) => delete d.edited);
    textarea.value = generated;
    $("edit-conflict")?.remove();
    syncMailto();
    textarea.focus();
    announce("Replaced your complaint with your updated answers.");
  });

  $("copy")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      announce("Copied your complaint.");
    } catch {
      textarea.focus();
      textarea.select();
      announce("Your browser blocked copying. Your complaint is selected; press Ctrl+C (Cmd+C on a Mac).");
    }
  });

  $("download")?.addEventListener("click", () => {
    const blob = new Blob([textarea.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accessibility-complaint.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce("Downloaded accessibility-complaint.txt.");
  });

  $("print")?.addEventListener("click", () => {
    const printable = $<HTMLElement>("print-complaint");
    if (printable) printable.textContent = textarea.value;
    window.print();
  });

  wireClearAnswersDialog(main, $<HTMLButtonElement>("clear"), () => {
    clearAnswers();
    nav.go("start", { cleared: "1" });
  });

  options.focus();
}
