/**
 * A small history-API router. Pages live at ?step=<id>, so in-page fragment
 * links (skip link, error summary) never collide with routing, and the
 * browser's Back button moves between steps.
 */

import { isPageId, type PageId } from "./steps/steps";

export interface Nav {
  href(page: PageId, params?: Record<string, string>): string;
  go(page: PageId, params?: Record<string, string>): void;
}

export interface ShowOptions {
  params: URLSearchParams;
  /**
   * Move focus after rendering: to the field with this id when given (a
   * Change link from Review), otherwise to the page's h1. On first load this
   * does nothing, so the browser starts at the top as usual.
   */
  focus(fieldId?: string | null): void;
}

export type PageRenderer = (main: HTMLElement, nav: Nav, options: ShowOptions) => void;

export function createRouter(main: HTMLElement, pages: Record<PageId, PageRenderer>) {
  let lastSearch = "";

  const href = (page: PageId, params: Record<string, string> = {}) =>
    "?" + new URLSearchParams({ step: page, ...params }).toString();

  const show = (moveFocus: boolean) => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("step");
    const page: PageId = isPageId(requested) ? requested : "start";
    lastSearch = window.location.search;

    const focus = (fieldId?: string | null) => {
      if (!moveFocus && !fieldId) return;
      const field = fieldId ? document.getElementById(fieldId) : null;
      if (field) {
        (field.closest("fieldset") ?? field.closest(".usa-form-group") ?? field).scrollIntoView({ block: "start" });
        field.focus({ preventScroll: true });
        return;
      }
      window.scrollTo(0, 0);
      main.querySelector<HTMLElement>("#page-heading")?.focus({ preventScroll: true });
    };

    pages[page](main, nav, { params, focus });
  };

  const nav: Nav = {
    href,
    go(page, params) {
      window.history.pushState(null, "", href(page, params));
      show(true);
    },
  };

  // Intercept same-page step links; leave modified clicks (new tab) alone.
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.("a");
    const raw = link?.getAttribute("href");
    if (!link || !raw?.startsWith("?") || link.target) return;
    event.preventDefault();
    window.history.pushState(null, "", raw);
    show(true);
  });

  // Back and Forward. A fragment jump (the skip link) also fires popstate;
  // ignore it when the step itself hasn't changed.
  window.addEventListener("popstate", () => {
    if (window.location.search === lastSearch) return;
    show(true);
  });

  return { start: () => show(false), nav };
}
