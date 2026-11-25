// Approved positioning facts the loader writes (04.1-07 fills the approved
// values). Every value names its source. An empty list means "nothing to
// change", never a placeholder.
import type { PositioningContent } from "@/lib/content-load/plan";
import { educationFacts } from "../lib/seed-facts";

export const positioning: PositioningContent = {
  education: educationFacts.map((fact) => ({
    ...fact,
    // PROJECT.md line 15
    source: "PROJECT.md line 15",
  })),
  skills: [],
  projects: [],
  experiences: [],
  slugRenames: [],
  // CONTEXT Claude's Discretion: stale e2e probe created in dev by the 2026-11-16 debug session
  retiredSlugs: ["e2e-stale-probe"],
};
