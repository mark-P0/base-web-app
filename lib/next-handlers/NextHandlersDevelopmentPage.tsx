import Link from "next/link";
import type { ArrayValues } from "@/lib/utils/types";
import { DevelopmentPreviewPage } from "./DevelopmentPreviewPage";
import { LOADING_PREVIEW_PATH } from "./loading-preview";

type Preview = ArrayValues<typeof PREVIEWS>;

const PREVIEWS = [
  {
    description: "Call notFound() to show the route-level 404 page.",
    href: "/dev/next-handlers/not-found",
    title: "Not found",
  },
  {
    description:
      "Throw during client rendering after you activate the control.",
    href: "/dev/next-handlers/error",
    title: "Application error",
  },
  {
    description: "Wait two seconds at request time to show the loading UI.",
    href: "/dev/next-handlers/loading",
    title: "Loading",
  },
  {
    description: "Throw from the root layout after you activate the control.",
    href: "/dev/next-handlers/global-error",
    title: "Global error",
  },
] as const;

function NextHandlersPreviewLink(props: { preview: Preview }) {
  const { preview } = props;

  if (preview.href === LOADING_PREVIEW_PATH) {
    return (
      <a
        className="block rounded-md border p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={preview.href}
      >
        <NextHandlersPreviewLinkContent preview={preview} />
      </a>
    );
  }

  return (
    <Link
      className="block rounded-md border p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      href={preview.href}
    >
      <NextHandlersPreviewLinkContent preview={preview} />
    </Link>
  );
}

function NextHandlersPreviewLinkContent(props: { preview: Preview }) {
  const { preview } = props;

  return (
    <>
      <span className="block font-medium">{preview.title}</span>
      <span className="block text-sm text-muted-foreground">
        {preview.description}
      </span>
    </>
  );
}

export function NextHandlersDevelopmentPage() {
  return (
    <DevelopmentPreviewPage
      description="Use these routes to test each stable root handler. Error previews reset to their inactive state when you select Try again. The loading preview uses a full page load so the streaming fallback is visible."
      title="Next.js handlers"
    >
      <ul className="space-y-3">
        {PREVIEWS.map((preview) => (
          <li key={preview.href}>
            <NextHandlersPreviewLink preview={preview} />
          </li>
        ))}
      </ul>
    </DevelopmentPreviewPage>
  );
}
