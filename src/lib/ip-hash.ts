import "server-only";
import { createHmac } from "node:crypto";

// HMAC-SHA256 of the IP with a server key: no raw IP is ever stored (D-09).
export function hashIp(ip: string, key: string): string {
  return createHmac("sha256", key).update(`contact-ip:${ip}`).digest("hex");
}
