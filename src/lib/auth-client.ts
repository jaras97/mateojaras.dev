"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin: baseURL is inferred from window.location. No signUp is used.
export const authClient = createAuthClient();
