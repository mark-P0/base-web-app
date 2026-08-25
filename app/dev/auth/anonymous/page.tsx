import type { Metadata } from "next";
import { AnonymousAuthDevelopmentPage } from "@/lib/auth/development/AnonymousAuthDevelopmentPage.client";

export const metadata: Metadata = {
  title: "Anonymous authentication",
};

export default function AnonymousAuthenticationDevelopmentPage() {
  return <AnonymousAuthDevelopmentPage />;
}
