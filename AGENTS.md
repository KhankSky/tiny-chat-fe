<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tiny Chat FE Agent Rules

## Project Shape

- This is the frontend project for Tiny Chat, built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and the App Router.
- Keep route files under `src/app` thin. Pages should compose feature components and handle route-level concerns only.
- Put domain UI and logic under `src/features/<feature>`.
- Put reusable primitives and cross-feature utilities under `src/shared`.
- Put locale dictionaries, formatting, and i18n types under `src/i18n`.

## Architecture Rules

- Prefer feature-first organization:
  - `components` for UI pieces owned by the feature.
  - `hooks` for stateful UI/data orchestration.
  - `api` for HTTP calls and API payload handling.
  - `realtime` for websocket/STOMP integration.
  - `utils` for pure feature helpers.
  - `types.ts` for feature contracts.
- Do not move feature-specific code into `shared` just because another file could import it. Promote to `shared` only when it is truly generic and already useful across features.
- Keep server and client boundaries explicit. Add `"use client"` only to files that need browser APIs, state, effects, event handlers, or client-only hooks.
- Keep API response types aligned with backend DTO names when possible.

## Clean Code Rules

- Favor small, named functions over long inline blocks when logic has branching, transformation, or side effects.
- Keep React components focused on rendering. Move data loading, subscriptions, optimistic updates, and form orchestration into hooks.
- Avoid mixing business logic, request logic, and JSX in one file.
- Use meaningful names that reveal intent: `loadHistoryAndConnect`, `sendMessage`, `socketStatus`, not vague names like `handleData` or `doStuff`.
- Prefer early returns for invalid states instead of deeply nested conditionals.
- Keep derived values close to where they are used, unless they are reused or expensive.
- Do not introduce broad abstractions until there is real repetition or a clear local pattern.
- Avoid comments that restate the code. Add comments only for non-obvious decisions, edge cases, protocol details, or browser/framework constraints.

## UI Rules

- Reuse existing shared UI components from `src/shared/ui` before creating new primitives.
- Keep layouts responsive and check mobile behavior for any new screen or major component.
- Avoid text overflow in buttons, badges, cards, sidebars, and chat bubbles.
- Keep visual style consistent with the existing dark chat/product UI unless the task explicitly asks for a redesign.
- Do not place user-facing static strings directly in components when the same screen already uses dictionaries. Add strings to `src/i18n/dictionaries`.

## State, Data, and Realtime

- Centralize browser session/token access through `src/shared/auth/session`.
- Centralize HTTP behavior through `src/shared/api/client` and feature API modules.
- For websocket/STOMP code, use `src/shared/realtime/stomp` and feature-level subscription helpers.
- Make optimistic UI reversible: if a request or socket send fails, restore user input or remove failed optimistic items.
- Always handle loading, empty, and error states for user-facing data flows.

## TypeScript Rules

- Use explicit exported types for feature contracts and API payloads.
- Prefer `type` imports for types.
- Avoid `any`. If a boundary is unknown, validate/narrow it before use.
- Keep nullability honest. Use `null` or optional fields intentionally and handle both at UI boundaries.