# Dark Mode Toggle and Development Page

## Summary

Add a global floating theme button with this cycle:

`system → light → dark → system`

Use a JavaScript-readable cookie. An early head script will read the cookie and apply the theme before first paint. This preserves static rendering and prevents a visible theme flash.

Add `/dev/dark-mode` as an interactive diagnostics and visual showcase page. The existing `/dev` layout will keep this page unavailable in production.

## Interfaces and behavior

- Define `ThemeMode = "system" | "light" | "dark"` under `lib/dark-mode`.
- Use `theme` as the cookie name. Missing or invalid values resolve to `system`.
- Set `Path=/`, `Max-Age=31536000`, and `SameSite=Lax`. Add `Secure` on HTTPS.
- Store the selected mode in `data-theme` on `<html>`.
- Toggle the existing `.dark` class according to the effective theme.
- Listen for `prefers-color-scheme` changes while `system` is selected.
- Emit a shared theme-change event so the toggle and development diagnostics stay synchronized.
- Show the current mode with the installed Monitor, Sun, and Moon icons.
- Give the button a dynamic accessible name that includes the current mode and next action.
- Use a 44-by-44-pixel circular target. Place it 16 pixels from mobile safe-area edges and 24 pixels from desktop edges.

## Implementation stages

1. **Create the durable plan copy** — `gpt-5.6-luna`, low effort
   - Add `plans/dark-mode-toggle.md` with this complete plan.
   - Stop for user review.

2. **Add the theme foundation** — `gpt-5.6-terra`, medium effort
   - Add mode cycling, validation, cookie parsing and serialization, system resolution, document updates, and event subscription helpers under `lib/dark-mode`.
   - Add an inline initialization script that reads the cookie before first paint.
   - Add Bun unit tests for the pure logic.
   - Update the plan file with implementation findings.
   - Run tests, lint, and TypeScript checks. Do not run a build.
   - Stop for user review.

3. **Integrate the global toggle** — `gpt-5.6-terra`, high effort
   - Add a small Client Component under `lib/dark-mode`.
   - Reuse the existing shadcn button and Lucide icons.
   - Mount the initialization script in `<head>` and the toggle in the root layout.
   - Keep the root layout as a Server Component. Do not call `cookies()` there.
   - Use `suppressHydrationWarning` on `<html>`.
   - Reapply the theme during the development Strict Mode remount.
   - Hide the button until its client state matches the initialized document state.
   - Add responsive positioning, safe-area offsets, focus treatment, and a screen-reader status announcement.
   - Update the plan file and run tests, lint, and TypeScript checks.
   - Stop for user review.

4. **Add `/dev/dark-mode`** — `gpt-5.6-terra`, medium effort
   - Add a responsive development page under the existing production-protected `/dev` layout.
   - Show live selected mode, effective light or dark theme, operating-system preference, and raw cookie value.
   - Subscribe to the shared theme-change event and system preference changes.
   - Add theme token swatches for background, foreground, primary, secondary, muted, accent, destructive, border, input, and ring colors.
   - Add representative cards, text, buttons, and form controls for visual contrast checks.
   - Include concise test instructions that direct the user to the global floating toggle.
   - Document the three modes, cookie contract, and development page in the README.
   - Update the plan file and run tests, lint, and TypeScript checks.
   - Stop for user review and manual browser testing.

5. **Complete and clean up** — `gpt-5.6-luna`, low effort
   - Apply corrections found during manual testing.
   - Run tests, lint, and TypeScript checks.
   - Remove `plans/dark-mode-toggle.md` after final acceptance.
   - Stop for final review.

## Test plan

- Verify all cycle transitions and invalid-cookie fallback.
- Verify light, dark, and system selections persist after refresh.
- Verify hard loads show the correct theme without a flash or hydration warning.
- Verify system mode reacts immediately when the operating-system preference changes.
- Verify explicit modes ignore later operating-system changes.
- Verify mouse, touch, Enter, and Space activation.
- Verify the accessible name, focus indicator, and status announcement.
- Verify placement at desktop and mobile widths, including safe-area insets.
- Verify the toggle appears and works on all application routes.
- Verify `/dev/dark-mode` diagnostics update after each toggle action and system preference change.
- Verify token samples and controls remain legible in all three modes.
- Verify `/dev/dark-mode` returns a 404 outside development.
- Ask the user to run the development server for visual checks. Do not run a build or development server.

## Assumptions

- The toggle applies globally, including development routes.
- Live synchronization between separate browser tabs is out of scope. Other tabs receive the updated mode after reload.
- The cookie contains no sensitive data and remains JavaScript-readable.
- Deployment is out of scope.
- No dependency installation stage is needed.

## Unanswered questions

None.
