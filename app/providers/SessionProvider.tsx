// app/providers/SessionProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

export default function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
  // We don't pass `session` prop here (client will fetch it).
  // If you prefer server-side session injection, we can pass session from layout using getServerSession.
  return <SessionProvider>{children}</SessionProvider>;
}
