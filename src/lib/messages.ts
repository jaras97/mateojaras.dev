import type en from "../../messages/en.json";
import es from "../../messages/es.json";

// Interface strings live in messages/en.json and messages/es.json (CLAUDE.md).
// next-intl is wired in phase 2; until then the lab reads the files directly.
// The type comes from en, so a key that es lacks fails tsc. An extra key in es
// does not, which is what messages.test.ts catches.

export type LabMessages = typeof en.Lab;

// The lab renders in Spanish (lang="es").
export const labMessages: LabMessages = es.Lab;
