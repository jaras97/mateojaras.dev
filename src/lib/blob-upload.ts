// Pure upload rules shared by the browser uploader and the token endpoint.
// No server-only import: the client component needs the same constants.

export const UPLOAD_CONTENT_TYPES = [
  "image/avif",
  "image/webp",
  "image/jpeg",
  "image/png",
];

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const UPLOAD_PATH =
  /^projects\/[0-9a-f-]{36}\/[a-z0-9._-]+\.(avif|webp|jpe?g|png)$/;

export function isAllowedUploadPath(pathname: string): boolean {
  return !pathname.includes("..") && UPLOAD_PATH.test(pathname);
}

// Lowercase, accents stripped, anything outside [a-z0-9._-] becomes "-".
export function safeUploadName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+/, "");
}
