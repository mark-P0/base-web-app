import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Next.js Handlers",
    template: "%s | Next.js Handlers | Development | Base Web App",
  },
};

export default function NextHandlersDevelopmentLayout(props: {
  children: ReactNode;
}) {
  const { children } = props;

  return children;
}
