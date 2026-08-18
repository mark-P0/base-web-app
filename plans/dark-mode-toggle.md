# Dark Mode Toggle and Development Page

## Summary

Add a global floating theme button with this cycle:

`system → light → dark → system`

Use `localStorage` for the selected mode. An early head script will read it and apply the theme before first paint. This preserves static rendering and prevents a visible theme flash.

Import dark-mode modules directly. Do not add a `lib/dark-mode` barrel export.

Add `/dev/dark-mode` as an interactive diagnostics and visual showcase page. The existing `/dev` layout will keep this page unavailable in production.

## Theme persistence decision

- Use `localStorage` with the `theme` key. Missing or invalid values resolve to `system`.
- Keep the root layout static. Do not read theme persistence from a Server Component.
- A parser-blocking browser script resolves `system` from `prefers-color-scheme` before first paint.
- A server-rendered root theme needs request-dependent rendering. That can reduce HTML caching, increase initial response time, and increase compute cost.
- Cookies provide no current benefit because the server does not consume the selected mode. `localStorage` avoids sending the theme value with every request.

## Interfaces and behavior

- Define `ThemeMode = "system" | "light" | "dark"` under `lib/dark-mode`.
- Use `theme` as the `localStorage` key. Missing or invalid values resolve to `system`.
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
   - Add mode cycling, validation, localStorage read and write helpers, system resolution, document updates, and event subscription helpers under `lib/dark-mode`.
   - Add a parser-blocking initialization script in `public/dark-mode-init.js` that reads the saved mode before first paint.
   - Add Bun unit tests for the pure logic.
   - Update the plan file with implementation findings.
   - Run tests, lint, and TypeScript checks. Do not run a build.
   - Stop for user review.

   Implementation findings:
   - `lib/dark-mode` contains the shared `ThemeMode` type, localStorage helpers, theme resolution, document updates, and event subscriptions.
   - `public/dark-mode-init.js` is ready for a root-layout `<head>` mount in stage 3. It applies `data-theme` and the existing `.dark` class before first paint.
   - The localStorage helpers use the `theme` key. The initialization script catches storage access failures and keeps the default light theme.
   - Theme unit tests are in `tests/unit/dark-mode/`. Reserve `tests/integration/` for browser or multi-module coverage.
   - Import modules directly from `lib/dark-mode`. Do not reintroduce a barrel export.

   Stage 3 implementation findings:
   - `ThemeToggle` is a Client Component in `lib/dark-mode/toggle.tsx`. It stays hidden until it reads and reapplies the initialized document mode.
   - The root layout stays static. It mounts the non-deferred `/dark-mode-init.js` script in `<head>` and uses `suppressHydrationWarning` on `<html>`.
   - The floating target is 44 by 44 pixels. It uses 16-pixel mobile and 24-pixel desktop safe-area offsets.
   - The toggle reapplies the theme during Strict Mode remounts, reacts to system-preference changes, and announces user-selected modes to screen readers.

3. **Integrate the global toggle** — `gpt-5.6-terra`, high effort
   - Add a small Client Component under `lib/dark-mode`.
   - Reuse the existing shadcn button and Lucide icons.
   - Mount `/dark-mode-init.js` as a non-deferred script in `<head>` and mount the toggle in the root layout.
   - Keep the root layout as a Server Component. Do not make it request-dependent for theme persistence.
   - Use `suppressHydrationWarning` on `<html>`.
   - Reapply the theme during the development Strict Mode remount.
   - Hide the button until its client state matches the initialized document state.
   - Add responsive positioning, safe-area offsets, focus treatment, and a screen-reader status announcement.
   - Update the plan file and run tests, lint, and TypeScript checks.
   - Stop for user review.

4. **Add `/dev/dark-mode`** — `gpt-5.6-terra`, medium effort
   - Add a responsive development page under the existing production-protected `/dev` layout.
   - Show live selected mode, effective light or dark theme, operating-system preference, and raw localStorage value.
   - Subscribe to the shared theme-change event and system preference changes.
   - Add theme token swatches for background, foreground, primary, secondary, muted, accent, destructive, border, input, and ring colors.
   - Add representative cards, text, buttons, and form controls for visual contrast checks.
   - Include concise test instructions that direct the user to the global floating toggle.
   - Document the three modes, localStorage contract, and development page in the README.
   - Update the plan file and run tests, lint, and TypeScript checks.
   - Stop for user review and manual browser testing.

   Implementation findings:
   - The protected `/dev/dark-mode` route renders a client diagnostics component while the route page stays server-rendered.
   - Diagnostics listen to the shared theme-change event and to operating-system preference changes. They show selected mode, effective theme, operating-system preference, and the raw `theme` localStorage value.
   - The page includes all requested token samples plus representative content, buttons, and form controls. The README documents the mode contract and test route.
   - Manual browser testing remains required. Start the development server and verify all three modes, operating-system changes in system mode, focus indicators, and visual contrast.

5. **Install the DOM test dependency** — `gpt-5.6-luna`, low effort
   - Add only `@happy-dom/global-registrator` as a development dependency.
   - Update package metadata and the lockfile. Do not add test setup or tests in this stage.
   - Stop for user review.

   Implementation findings:
   - `@happy-dom/global-registrator` version `20.11.2` is installed as a development dependency. Bun updated `package.json` and `bun.lock`.

6. **Add the integration test setup** — `gpt-5.6-luna`, medium effort
   - Register Happy DOM for Bun integration tests.
   - Add shared DOM cleanup, React `act()` configuration, and a deterministic `matchMedia` test helper.
   - Add separate unit and integration test commands without adding another test framework.
   - Replace the integration-test placeholder with the project test boundary and execution instructions.
   - Keep current tests passing. Run tests, lint, and TypeScript checks. Do not run a build or development server.
   - Update the plan file with implementation findings.
   - Stop for user review.

   Implementation findings:
   - `bun run test:unit` runs pure tests from `tests/unit/`. `bun run test:integration` preloads `tests/integration/setup.js` and runs tests from `tests/integration/`.
   - The preload registers Happy DOM, enables React `act()`, clears the DOM and web storage after each test, and restores the default `matchMedia` function.
   - `tests/integration/match-media.js` provides deterministic media-query values and change notifications for integration tests.

7. **Add dark-mode unit and integration coverage** — `gpt-5.6-terra`, high effort
   - Add direct unit coverage for document updates and theme-change subscriptions.
   - Execute the real initialization script in Happy DOM. Verify stored, missing, invalid, explicit, and system modes.
   - Render the real `ThemeToggle` with its real Button, theme, and document modules.
   - Verify the complete mode cycle, persistence, root attributes and classes, system-preference handling, shared events, accessible names, icons, status announcements, focus, native-button semantics, storage failures, and Strict Mode remounts.
   - Render the toggle and development diagnostics together. Verify synchronization after toggle and system-preference changes.
   - Verify the layout and responsive-positioning markup contracts that do not require computed browser layout.
   - Keep paint timing, hydration, computed styling, safe-area layout, native touch and keyboard behavior, cross-route behavior, and the production-only 404 in the manual browser checklist.
   - Update documentation and the plan file with implementation findings.
   - Run unit and integration tests, lint, and TypeScript checks. Do not run a build or development server.
   - Stop for user review and manual browser testing.

   Implementation findings:
   - Unit tests cover document root updates, shared theme-change subscriptions, and system-preference subscriptions without a browser DOM.
   - Happy DOM integration tests execute the deployed initialization script and render the real toggle and diagnostics components with their production dependencies.
   - The integration tests cover persistence, mode cycling, document state, shared updates, icons, accessible labels, status announcements, native button markup, focus markup, storage failures, Strict Mode remounts, and responsive placement class contracts.
   - Manual browser testing remains required for paint timing, hydration warnings, computed styling, safe-area layout, touch and keyboard activation, cross-route behavior, and the production-only diagnostics 404. The README lists this checklist.

8. **Rewrite test files in TypeScript** — `gpt-5.6-luna`, medium effort
   - Convert the unit and integration test files and test helpers from JavaScript to TypeScript.
   - Add only the type support that Bun requires for test files. Do not add another test framework.
   - Keep the unit and integration test commands unchanged.
   - Run unit and integration tests, lint, and TypeScript checks. Do not run a build or development server.
   - Stop for user review.

9. **Complete and clean up** — `gpt-5.6-luna`, low effort
   - Apply corrections found during manual testing.
   - Run unit and integration tests, lint, and TypeScript checks.
   - Remove `plans/dark-mode-toggle.md` after final acceptance.
   - Stop for final review.

## Test plan

- Classify a test as integration when it renders UI in a DOM environment or exercises a network boundary. Otherwise, classify it as unit.
- Store unit tests under `tests/unit/` and integration tests under `tests/integration/`.
- Use Bun, Happy DOM, React `act()`, and `react-dom/client`. Do not add Playwright, Vitest, Jest, jsdom, or Testing Library.
- Verify all cycle transitions and invalid-storage fallback.
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
- The localStorage value contains no sensitive data and remains JavaScript-readable.
- Deployment is out of scope.
- Happy DOM supplies browser APIs for integration tests. It does not replace real-browser acceptance checks.

## Unanswered questions

None.
