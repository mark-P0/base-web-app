import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Next.js Handlers",
    template: "%s | Next.js Handlers | Development | Base Web App",
  },
};

export default function NextHandlersDevelopmentLayout(
  props: LayoutProps<"/dev/next-handlers">,
) {
  const { children } = props;

  return children;
}
