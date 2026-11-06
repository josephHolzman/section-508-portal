/**
 * Confirmation before clearing answers, used by Start ("Start over") and Send
 * ("Clear my answers"). A native <dialog> opened with showModal() traps focus,
 * makes the page behind inert and closes on Escape. Focus starts on Cancel,
 * the safe choice, and returns to the button that opened it.
 */

import { html, type SafeHtml } from "./html";

export function clearAnswersDialog(): SafeHtml {
  return html`
    <dialog class="confirm-dialog" id="clear-dialog" aria-labelledby="clear-dialog-heading" aria-describedby="clear-dialog-text">
      <h2 id="clear-dialog-heading">Clear all your answers?</h2>
      <p id="clear-dialog-text">This deletes everything you entered, including your complaint. You can't undo it.</p>
      <ul class="usa-button-group">
        <li class="usa-button-group__item">
          <button type="button" class="usa-button usa-button--outline" id="clear-cancel">Cancel</button>
        </li>
        <li class="usa-button-group__item">
          <button type="button" class="usa-button usa-button--secondary" id="clear-confirm">Clear answers</button>
        </li>
      </ul>
    </dialog>
  `;
}

/** Open the dialog from `opener`; run `onConfirm` if the person confirms. */
export function wireClearAnswersDialog(root: HTMLElement, opener: HTMLElement | null, onConfirm: () => void): void {
  const dialog = root.querySelector<HTMLDialogElement>("#clear-dialog");
  if (!dialog || !opener) return;
  const cancel = dialog.querySelector<HTMLButtonElement>("#clear-cancel");

  opener.addEventListener("click", () => {
    dialog.returnValue = "";
    dialog.showModal();
    cancel?.focus();
  });
  cancel?.addEventListener("click", () => dialog.close("cancel"));
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "cleared") opener.focus();
  });
  dialog.querySelector("#clear-confirm")?.addEventListener("click", () => {
    dialog.close("cleared");
    onConfirm();
  });
}
