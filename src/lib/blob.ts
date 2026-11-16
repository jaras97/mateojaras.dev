import "server-only";

// Vercel Blob needs BLOB_READ_WRITE_TOKEN. Callers gate every upload on this
// and show the tokenMissing copy instead of failing late.
export function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}
