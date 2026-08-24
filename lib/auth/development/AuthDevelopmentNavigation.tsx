import Link from "next/link";

const authenticationDevelopmentLinks = [
  { href: "/dev/auth", label: "Session hub" },
  { href: "/dev/auth/anonymous", label: "Anonymous" },
  { href: "/dev/auth/google", label: "Google" },
  { href: "/dev/auth/email", label: "Email" },
  { href: "/dev/auth/protected", label: "Protected page" },
] as const;

export function AuthDevelopmentNavigation() {
  return (
    <nav aria-label="Authentication development pages" className="pt-2">
      <ul className="flex flex-wrap gap-2">
        {authenticationDevelopmentLinks.map((link) => (
          <li key={link.href}>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
