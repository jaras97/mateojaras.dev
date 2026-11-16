import { z } from "zod";

// Zod probes `new Function` for its JIT parser; a strict CSP reports that probe
// as a violation. Imported first by the client login form, before any schema
// is built, so the browser skips the probe. The server keeps the fast path.
z.config({ jitless: true });
