import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  type GetProtectedAuthSession,
  ProtectedAuthDevelopmentPage,
} from "@/lib/auth/development/ProtectedAuthDevelopmentPage";
import { auth } from "@/lib/better-auth/auth";

export const metadata: Metadata = {
  title: "Protected authentication content",
};

async function getDatabaseValidatedSession(
  args: Parameters<GetProtectedAuthSession>[0],
) {
  const { headers: requestHeaders, query } = args;
  const session = await auth.api.getSession({
    headers: requestHeaders,
    query,
  });

  return session;
}

export default async function ProtectedAuthenticationDevelopmentPage() {
  const requestHeaders = await headers();

  return (
    <ProtectedAuthDevelopmentPage
      getSession={getDatabaseValidatedSession}
      requestHeaders={requestHeaders}
    />
  );
}
