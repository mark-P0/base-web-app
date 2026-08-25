import type { Metadata } from "next";
import { GoogleAuthDevelopmentPage } from "@/lib/auth/development/GoogleAuthDevelopmentPage.client";
import { serverEnvironment } from "@/lib/environment/server";

export const metadata: Metadata = {
  title: "Google authentication",
};

export default function GoogleAuthenticationDevelopmentPage() {
  const configurationStatus = serverEnvironment.googleCredentials
    ? "configured"
    : "unconfigured";

  return (
    <GoogleAuthDevelopmentPage configurationStatus={configurationStatus} />
  );
}
