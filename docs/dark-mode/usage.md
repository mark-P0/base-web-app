# Dark mode usage

## Behavior

The floating theme button changes the selected mode in this order:

1. `system`
2. `light`
3. `dark`

The `system` mode follows the operating-system color preference. The `light` and `dark` modes use a fixed theme.

The browser stores the selected mode in `localStorage` with the `theme` key. A missing or invalid value uses `system`.

The root document stores the selected mode in the `data-theme` attribute. It applies the `dark` class only when the effective theme is dark.

## Implementation

- `public/dark-mode-init.js` applies the stored theme before React hydration.
- `lib/dark-mode/theme.ts` validates, stores, and resolves theme modes.
- `lib/dark-mode/document.ts` applies theme state to the document and sends theme events.
- `lib/dark-mode/ThemeToggle.client.tsx` provides the global theme button.
- `app/layout.tsx` loads the initialization script and renders the theme button.

## Development diagnostics

Start the development server. Open [`/dev/dark-mode`](http://localhost:3000/dev/dark-mode).

The page shows the selected mode, effective theme, operating-system preference, stored value, theme tokens, and contrast samples. The route is unavailable in production.

## Automated verification

Run these commands:

```bash
bun run test:unit
bun run test:integration
```

## Manual verification

- Confirm that a hard load applies each mode without a visible flash or hydration warning.
- Confirm that the button works with a pointer, Enter, and Space.
- Confirm that `system` mode responds to an operating-system theme change.
- Confirm that `light` and `dark` modes ignore operating-system theme changes.
- Confirm that the button has a visible focus indicator.
- Confirm that the button keeps safe spacing at mobile and desktop widths.
- Confirm that the diagnostics page updates after each mode change.
- Confirm that token samples and form controls remain legible.
- Confirm that `/dev/dark-mode` returns a 404 response in production.
