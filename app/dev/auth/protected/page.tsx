import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ProtectedAuthDevelopmentPage,
  requireProtectedSession,
} from "@/lib/auth/development/ProtectedAuthDevelopmentPage";
import { auth } from "@/lib/better-auth/auth";

export const metadata: Metadata = { title: "Protected authentication page" };

export default async function ProtectedAuthenticationDevelopmentPage() {
  const requestHeaders = await headers();
  const session = await requireProtectedSession({
    getSession: async () => {
      const validatedSession = await auth.api.getSession({
        headers: requestHeaders,
      });

      return validatedSession;
    },
    redirectUnauthenticated: () => redirect("/dev/auth"),
  });

  return <ProtectedAuthDevelopmentPage session={session} />;
}
