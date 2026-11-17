// Shared result of every admin Server Action. Server Actions are public POST
// endpoints, so the shape is plain data: no thrown errors cross the boundary.
export type ActionResult<T = object> =
  | ({ ok: true; savedAt: string } & T)
  | {
      ok: false;
      error:
        | "session"
        | "not_found"
        | "validation"
        | "conflict"
        | "server"
        | "token";
      fieldErrors?: Record<string, string[]>;
    };
