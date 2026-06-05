"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Wraps children with NextAuth SessionProvider so useSession and session are available.
 * @param {{ children: import("react").ReactNode }} props
 */
export function SessionProvider({ children }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
