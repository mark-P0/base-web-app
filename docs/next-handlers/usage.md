# Next.js root handler usage

## Handler scope and hierarchy

The application defines four stable root handlers:

| File | Scope |
| --- | --- |
| `app/loading.tsx` | Shows a loading fallback while a page or nested layout streams. It does not wrap the root layout or the root error boundary. |
| `app/not-found.tsx` | Shows the not-found page after a route calls `notFound()`. The root file also handles unmatched URLs. |
| `app/error.tsx` | Catches uncaught errors from pages and nested layouts below the root layout. It does not catch errors from the root layout. |
| `app/global-error.tsx` | Catches uncaught errors from the root layout or root template. It replaces the root layout and defines a complete HTML document. |

The root error boundary wraps the loading fallback, the not-found page, all pages, and all nested layouts. The loading boundary wraps the not-found page, all pages, and all nested layouts. The global error boundary is outside the root layout.

Keep expected errors in the normal application flow. Return an error result or show a specific state for validation errors, missing data, and failed requests. Use these error boundaries for uncaught exceptions.

## Shared interface

The root handler files are thin Next.js adapters. Shared interface and preview logic is in `lib/next-handlers/`.

The not-found and error pages provide a home link. Error pages also provide a **Try again** button. This button calls the Next.js `retry()` function. A successful retry replaces the error fallback with the recovered route.

The interface does not show `error.message`. Server error messages can contain private data. The interface shows `error.digest` as an error reference when Next.js supplies it.

The global error page imports its own styles and fonts because it replaces the root layout. It also applies the stored theme after it mounts. The page keeps the light theme if browser storage or color-scheme APIs are unavailable.

## Development previews

Start the development server with `bun dev`. Open [`/dev/next-handlers`](http://localhost:3000/dev/next-handlers) to see the preview index.

Use these routes:

| Route | Verification |
| --- | --- |
| [`/dev/next-handlers`](http://localhost:3000/dev/next-handlers) | Shows links and instructions for all handler previews. |
| [`/dev/next-handlers/not-found`](http://localhost:3000/dev/next-handlers/not-found) | Calls `notFound()` and shows the root not-found page. |
| [`/dev/next-handlers/error`](http://localhost:3000/dev/next-handlers/error) | Shows a control that throws during client rendering. The root error boundary handles the error. |
| [`/dev/next-handlers/loading`](http://localhost:3000/dev/next-handlers/loading) | Waits for two seconds at request time. Use the index link or a full page load to see the streaming fallback. |
| [`/dev/next-handlers/global-error`](http://localhost:3000/dev/next-handlers/global-error) | Shows a root-layout control that throws during client rendering. The global error boundary handles the error. |

The development layout blocks all `/dev` routes outside development. The root layout mounts the global error trigger only in development. It activates the trigger only on the exact global error preview route.

When you select **Try again** on an error preview, Next.js remounts the preview in its inactive state. Activate the control again to repeat the test.

## Error reporting

The application does not have an error-reporting service. Add reporting in `lib/next-handlers/ErrorPage.client.tsx` when the application gets one. Report the supplied `Error` object from an effect. Apply service-side deduplication because React development checks and retries can report an error more than once.

Use `error.digest` to match a server error with server logs. Do not add `error.message`, stack traces, request data, or user data to the rendered interface. Filter private data before you send an error to an external service.

## Experimental handlers

The application does not enable these experimental handlers:

- `global-not-found.tsx` is not required because the application has one root layout. The stable root `not-found.tsx` handles unmatched URLs.
- `unauthorized.tsx` is not required because the application has no authentication feature.
- `forbidden.tsx` is not required because the application has no authorization feature.

Do not add experimental Next.js flags for these handlers. Review their status and the application requirements before you add them.

## Automated verification

Run these commands without a development server:

```bash
bun run lint
bun run test:unit
bun run test:integration
bun x tsc --noEmit
```

Do not run a production build for this verification.

## Manual verification

- Verify all five development routes.
- Verify that each error control starts in a safe state.
- Verify that **Try again** restores the safe state.
- Verify that **Go to home** opens the home page.
- Verify the loading announcement with assistive technology.
- Verify keyboard operation and visible focus indicators.
- Verify the layout at mobile and desktop widths.
- Verify the `system`, `light`, and `dark` themes on the normal and global error pages.
- Verify that `/dev` routes are unavailable in production.
