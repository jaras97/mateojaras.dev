import { type ContactInput, contactSchema, MIN_ELAPSED_MS } from "./validation";

export type ContactResult =
  | { ok: true }
  | {
      ok: false;
      error: "validation" | "rate_limited" | "unavailable";
      fieldErrors?: Record<string, string[]>;
    };

export type ContactDeps = {
  limiter: {
    limit(id: string): Promise<{ success: boolean; reason?: string }>;
  } | null;
  ipHash: string;
  insert(row: {
    name: string;
    email: string;
    message: string;
    locale: "en" | "es";
    ipHash: string;
  }): Promise<{ id: string }>;
  schedule(id: string, msg: ContactInput): void;
  log(msg: string, err?: unknown): void;
};

// D-09 order: Zod, honeypot/elapsed (silent discard), rate limit, insert,
// then the notification is scheduled. The visitor's result never depends on
// Resend. Logs carry codes only, never visitor data.
export async function submitContactCore(
  locale: unknown,
  input: unknown,
  deps: ContactDeps,
): Promise<ContactResult> {
  const base = typeof input === "object" && input !== null ? input : {};
  const parsed = contactSchema.safeParse({ ...base, locale });
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      fieldErrors: z_flatten(parsed.error.issues),
    };
  }
  const data = parsed.data;

  if (data.website !== "" || data.elapsedMs < MIN_ELAPSED_MS) {
    return { ok: true };
  }

  if (!deps.limiter) {
    deps.log(
      "Falta UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (o KV_REST_API_*): formulario de contacto no disponible",
    );
    return { ok: false, error: "unavailable" };
  }
  try {
    const res = await deps.limiter.limit(deps.ipHash);
    if (res.reason === "timeout") {
      deps.log("contact rate limit timeout");
      return { ok: false, error: "unavailable" };
    }
    if (!res.success) return { ok: false, error: "rate_limited" };
  } catch (error) {
    deps.log("contact rate limit failed", errorName(error));
    return { ok: false, error: "unavailable" };
  }

  let id: string;
  try {
    ({ id } = await deps.insert({
      name: data.name,
      email: data.email,
      message: data.message,
      locale: data.locale,
      ipHash: deps.ipHash,
    }));
  } catch (error) {
    deps.log("contact insert failed", errorName(error));
    return { ok: false, error: "unavailable" };
  }
  deps.schedule(id, data);
  return { ok: true };
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}

function z_flatten(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] = [...(out[key] ?? []), issue.message];
  }
  return out;
}
