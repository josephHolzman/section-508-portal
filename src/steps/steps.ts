/** The five steps, in order, with the labels the step indicator shows. */

export type StepId = "where" | "what-happened" | "what-you-need" | "review" | "send";
export type PageId = "start" | StepId | "agency" | "state-local" | "about";

export const STEPS: readonly { id: StepId; label: string; title: string }[] = [
  { id: "where", label: "Where", title: "Where did it happen?" },
  { id: "what-happened", label: "What happened", title: "What happened?" },
  { id: "what-you-need", label: "What you need", title: "What do you need?" },
  { id: "review", label: "Review", title: "Review your complaint" },
  { id: "send", label: "Send", title: "Send your complaint" },
];

export function stepNumber(id: StepId): number {
  return STEPS.findIndex((s) => s.id === id) + 1;
}

export function isPageId(value: string | null): value is PageId {
  return (
    value === "start" ||
    value === "about" ||
    value === "agency" ||
    value === "state-local" ||
    STEPS.some((s) => s.id === value)
  );
}

/** Document title for a step, e.g. "Step 2 of 5: What happened? – Barrier Report". */
export function stepDocumentTitle(id: StepId, hasErrors = false, title?: string): string {
  const step = STEPS[stepNumber(id) - 1];
  const base = `Step ${stepNumber(id)} of ${STEPS.length}: ${title ?? step?.title ?? ""} – Barrier Report`;
  return hasErrors ? `Error: ${base}` : base;
}
