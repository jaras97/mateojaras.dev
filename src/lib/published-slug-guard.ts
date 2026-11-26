// D-06. Bounded blocking load when the memo is cold or misses, so unknown slugs
// get a real 404 even on a fresh instance. Fail open only on DB error or
// timeout. Never memoize negatives. Unpublish window up to TTL plus one refresh
// is accepted (the page notFound() covers it).
export const TTL_MS = 60_000;
export const TIMEOUT_MS = 1_500;

type Deps = {
  load: () => Promise<string[]>;
  waitUntil: (p: Promise<unknown>) => void;
  now?: () => number;
};

let memo: { slugs: Set<string>; at: number } | null = null;
let inflight: Promise<string[]> | null = null;

function refresh(load: () => Promise<string[]>, now: () => number) {
  if (inflight) return inflight;
  const p = load().then(
    (slugs) => {
      memo = { slugs: new Set(slugs), at: now() };
      inflight = null;
      return slugs;
    },
    (error) => {
      inflight = null;
      throw error;
    },
  );
  inflight = p;
  return p;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("slug load timed out")),
      ms,
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function isPublishedSlug(
  slug: string,
  { load, waitUntil, now = Date.now }: Deps,
): Promise<boolean> {
  if (memo?.slugs.has(slug)) {
    if (now() - memo.at > TTL_MS) {
      waitUntil(refresh(load, now).catch(() => {}));
    }
    return true;
  }
  // Cold memo or warm miss: re-read the list, bounded by TIMEOUT_MS.
  try {
    const slugs = await withTimeout(refresh(load, now), TIMEOUT_MS);
    return slugs.includes(slug);
  } catch {
    return true;
  }
}

export function __resetForTests() {
  memo = null;
  inflight = null;
}
