/** Start and About. */

import { clearAnswersDialog, wireClearAnswersDialog } from "../lib/dialog";
import { html, mount } from "../lib/html";
import { clearAnswers, loadAnswers } from "../lib/state";
import type { PageRenderer } from "../router";
import type { PageId } from "./steps";

/** The furthest step the person has answers for, to resume there. */
function resumeStep(): PageId | null {
  const a = loadAnswers();
  if (a.whatYouNeed) return "review";
  if (a.whatHappened) return "what-happened";
  if (a.where?.agencyKey) return "what-happened";
  if (a.where?.kind) return "where";
  return null;
}

export const showStart: PageRenderer = (main, nav, options) => {
  document.title = "Report an accessibility barrier on a federal website – Barrier Report";
  const cleared = options.params.get("cleared") === "1";
  const resume = cleared ? null : resumeStep();

  mount(
    main,
    html`
      ${cleared
        ? html`<div class="usa-alert usa-alert--success usa-alert--slim page-block">
            <div class="usa-alert__body"><p class="usa-alert__text">Your answers were cleared.</p></div>
          </div>`
        : ""}
      ${resume
        ? html`<div class="usa-alert usa-alert--info page-block" id="resume-alert">
            <div class="usa-alert__body">
              <h2 class="usa-alert__heading">You have answers from earlier in this tab</h2>
              <p class="margin-top-2 margin-bottom-0">
                <a class="usa-button" href="${nav.href(resume)}">Continue where I left off</a>
              </p>
              <p class="margin-top-2 margin-bottom-0">
                <button type="button" class="usa-button usa-button--unstyled" id="start-over">
                  Start over and clear these answers
                </button>
              </p>
            </div>
          </div>
          ${clearAnswersDialog()}`
        : ""}
      <h1 id="page-heading" tabindex="-1">Report an accessibility barrier on a federal website</h1>
      <p class="usa-intro measure-4">
        Answer a few questions and we'll help you write a clear complaint and show you where to send it.
      </p>
      <ul class="usa-list">
        <li>It takes about 5 minutes.</li>
        <li>Nothing is sent or saved. Your answers stay in this browser tab and are deleted when you close it.</li>
        <li>You send the complaint yourself, to the agency responsible.</li>
      </ul>
      <div class="usa-summary-box page-block" role="region" aria-labelledby="before-heading">
        <div class="usa-summary-box__body">
          <h2 class="usa-summary-box__heading" id="before-heading">Before you start</h2>
          <div class="usa-summary-box__text">
            <p class="margin-0">
              If you can, take a screenshot of the problem before you leave that page. Cover or crop any personal
              information, like your Social Security number. It's optional.
            </p>
          </div>
        </div>
      </div>
      <p><a class="usa-button usa-button--big" href="${nav.href("where")}">Start</a></p>
      <h2>What this tool doesn't do</h2>
      <ul class="usa-list">
        <li>It doesn't send anything for you.</li>
        <li>It doesn't give legal advice.</li>
        <li>It doesn't speak for any government agency.</li>
      </ul>
    `,
  );

  wireClearAnswersDialog(main, main.querySelector<HTMLElement>("#start-over"), () => {
    clearAnswers();
    nav.go("where");
  });
  options.focus();
};

export const showAbout: PageRenderer = (main, _nav, options) => {
  document.title = "About this tool – Barrier Report";
  mount(
    main,
    html`
      <h1 id="page-heading" tabindex="-1">About this tool</h1>
      <p class="measure-4">
        Barrier Report is an unofficial concept by Joseph Holzman. It is not a government website, doesn't send your
        complaint, and doesn't give legal advice. It runs entirely in your browser and makes no network requests.
      </p>
      <h2 id="report-a-problem" tabindex="-1">Report a problem with this tool</h2>
      <p class="measure-4">[Contact link to be added before launch.]</p>
      <h2 id="accessibility-report" tabindex="-1">This tool's accessibility report</h2>
      <p class="measure-4">[The WCAG 2.2 AA conformance report will be published here after the audit.]</p>
    `,
  );
  options.focus(options.params.get("focus"));
};
