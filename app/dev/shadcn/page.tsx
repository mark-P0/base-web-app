import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/lib/shadcn/button";
import { Input } from "@/lib/shadcn/input";
import { Label } from "@/lib/shadcn/label";
import { Textarea } from "@/lib/shadcn/textarea";

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const buttonSizes = ["xs", "sm", "default", "lg"] as const;

export default function ShadcnDevelopmentPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Development / UI
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Component showcase
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A visual reference for the shared interface components and their
                supported states.
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full border bg-background px-3 py-1 font-mono text-xs text-muted-foreground shadow-xs">
            shadcn / new-york
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-xl border bg-background p-5 shadow-xs sm:p-6">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold">Button</h2>
              <p className="text-sm text-muted-foreground">
                Variants, sizes, icons, and disabled states.
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="font-mono text-xs text-muted-foreground uppercase">
                  Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  {buttonVariants.map((variant) => (
                    <Button key={variant} variant={variant}>
                      {variant}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-mono text-xs text-muted-foreground uppercase">
                  Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {buttonSizes.map((size) => (
                    <Button key={size} size={size} variant="outline">
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-mono text-xs text-muted-foreground uppercase">
                  Icon and state
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="icon" aria-label="Add item">
                    <Plus />
                  </Button>
                  <Button variant="secondary">
                    Continue
                    <ArrowRight />
                  </Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-5 shadow-xs sm:p-6">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold">Form controls</h2>
              <p className="text-sm text-muted-foreground">
                Labels, text inputs, and multiline input states.
              </p>
            </div>

            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dev-name">Name</Label>
                <Input id="dev-name" placeholder="Ada Lovelace" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-email">Email</Label>
                <Input
                  id="dev-email"
                  type="email"
                  defaultValue="not-an-email"
                  aria-invalid="true"
                  aria-describedby="dev-email-error"
                />
                <p id="dev-email-error" className="text-xs text-destructive">
                  Enter a valid email address.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-notes">Notes</Label>
                <Textarea
                  id="dev-notes"
                  placeholder="Add implementation notes…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-disabled">Disabled</Label>
                <Input
                  id="dev-disabled"
                  defaultValue="This field cannot be changed"
                  disabled
                />
              </div>

              <Button type="submit" className="w-full">
                Save example
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
