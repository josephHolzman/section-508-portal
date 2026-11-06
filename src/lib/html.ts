/**
 * A tiny tagged template for building markup safely.
 *
 * Every interpolated value is HTML-escaped unless it is itself the result of
 * `html`. People type their own words into this tool, so nothing they enter
 * may ever be parsed as markup.
 */

const SAFE = Symbol("safe-html");

export interface SafeHtml {
  readonly [SAFE]: true;
  readonly value: string;
}

type Interpolation = SafeHtml | string | number | boolean | null | undefined | Interpolation[];

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

function isSafe(value: unknown): value is SafeHtml {
  return typeof value === "object" && value !== null && SAFE in value;
}

function render(value: Interpolation): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (isSafe(value)) return value.value;
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: Interpolation[]): SafeHtml {
  let out = strings[0] ?? "";
  values.forEach((value, i) => {
    out += render(value) + (strings[i + 1] ?? "");
  });
  return { [SAFE]: true, value: out };
}

/** Render markup into an element, replacing its contents. */
export function mount(el: Element, markup: SafeHtml): void {
  el.innerHTML = markup.value;
}
