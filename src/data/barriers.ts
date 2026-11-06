/**
 * Plain-language barriers shown on "What happened?", in display order.
 *
 * `wcag` lists *possibly related* WCAG 2.0 success criteria (Section 508
 * incorporates WCAG 2.0 Level A and AA). They appear only in the optional
 * "for your accessibility team" appendix, never in the person's own words.
 * Spot-check each row against the WCAG 2.0 text before shipping.
 */

export interface Barrier {
  id: BarrierId;
  label: string;
  description: string;
  wcag: string[];
}

export type BarrierId =
  | "keyboard"
  | "screen-reader"
  | "hard-to-see"
  | "zoom"
  | "captions"
  | "transcript"
  | "document"
  | "time"
  | "security-check"
  | "voice-switch"
  | "confusing"
  | "other";

export const OTHER_BARRIER: BarrierId = "other";

export const BARRIERS: readonly Barrier[] = [
  {
    id: "keyboard",
    label: "I couldn't reach or use something with my keyboard",
    description: "Tab, Enter, or arrow keys couldn't reach a button, link, or field.",
    wcag: ["2.1.1 Keyboard", "2.1.2 No Keyboard Trap", "2.4.3 Focus Order", "2.4.7 Focus Visible"],
  },
  {
    id: "screen-reader",
    label: "My screen reader skipped, misread, or couldn't read something",
    description: "It skipped content, read it wrong, or said nothing useful.",
    wcag: [
      "1.1.1 Non-text Content",
      "1.3.1 Info and Relationships",
      "2.4.4 Link Purpose (In Context)",
      "4.1.2 Name, Role, Value",
    ],
  },
  {
    id: "hard-to-see",
    label: "Text, buttons, or images were too hard to see",
    description: "Low contrast, tiny text, or meaning shown only by color.",
    wcag: ["1.4.1 Use of Color", "1.4.3 Contrast (Minimum)", "1.4.5 Images of Text"],
  },
  {
    id: "zoom",
    label: "Things broke or overlapped when I zoomed in or made text bigger",
    description: "Text overlapped, got cut off, or the page stopped working.",
    wcag: ["1.4.4 Resize Text"],
  },
  {
    id: "captions",
    label: "A video had no captions, or the captions were wrong",
    description: "Captions were missing, out of sync, or inaccurate.",
    wcag: ["1.2.2 Captions (Prerecorded)", "1.2.4 Captions (Live)"],
  },
  {
    id: "transcript",
    label: "Audio or video had no transcript or description",
    description: "No text version of audio, or no description of what's shown.",
    wcag: [
      "1.2.1 Audio-only and Video-only (Prerecorded)",
      "1.2.3 Audio Description or Media Alternative (Prerecorded)",
      "1.2.5 Audio Description (Prerecorded)",
    ],
  },
  {
    id: "document",
    label: "A document, like a PDF, couldn't be read",
    description: "It couldn't be read aloud, searched, or moved through in order.",
    wcag: ["1.1.1 Non-text Content", "1.3.1 Info and Relationships", "1.3.2 Meaningful Sequence"],
  },
  {
    id: "time",
    label: "Time ran out before I could finish",
    description: "The page timed out or logged me out.",
    wcag: ["2.2.1 Timing Adjustable"],
  },
  {
    id: "security-check",
    label: "A security check, like a CAPTCHA, blocked me",
    description: "A puzzle, image, or audio test stopped me.",
    wcag: ["1.1.1 Non-text Content (CAPTCHA provision)"],
  },
  {
    id: "voice-switch",
    label: "Voice control or switch access didn't work",
    description: "Voice commands or switch controls couldn't operate it.",
    wcag: ["2.1.1 Keyboard", "4.1.2 Name, Role, Value"],
  },
  {
    id: "confusing",
    label: "Instructions or error messages were confusing",
    description: "I couldn't tell what to enter or how to fix a mistake.",
    wcag: ["3.3.1 Error Identification", "3.3.2 Labels or Instructions", "3.3.3 Error Suggestion"],
  },
  {
    id: "other",
    label: "Something else",
    description: "You'll be able to describe it.",
    wcag: [],
  },
];

export function isBarrierId(value: string): value is BarrierId {
  return BARRIERS.some((b) => b.id === value);
}
