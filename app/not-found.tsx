import { StatusPage } from "@/lib/next-handlers/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      description="The page you requested does not exist or is no longer available."
      title="Page not found"
    />
  );
}
