import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Content-Security-Policy for the built site. connect-src 'none' makes the
 * browser itself block every network request, so answers can't leave the
 * device even by mistake. form-action 'none' blocks real form submission
 * (forms are handled in script). Applied to builds only: the dev server needs
 * a websocket and inline styles for hot reload. Test with `npm run preview`.
 *
 * frame-ancestors can't be set in a meta tag; set it as a response header on
 * the host.
 */
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "object-src 'none'",
].join("; ");

function contentSecurityPolicy(): Plugin {
  return {
    name: "barrier-report-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="utf-8" />',
        `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [contentSecurityPolicy()],
  build: {
    // Keep the module preload polyfill out of inline script.
    modulePreload: { polyfill: false },
  },
  test: {
    environment: "jsdom",
  },
});
