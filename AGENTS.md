<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Guide

## Scope and Boundaries

- This is a Next.js App Router application with separate user and manager/admin experiences.
- Browser code talks to same-origin route handlers under `app/api/`. Route handlers proxy to `auth_service`, `content_service`, and `exercise_service`; do not expose internal Docker hostnames or service credentials to client components.
- Keep access tokens and refresh behavior inside the existing auth/BFF flow. Do not add direct browser calls to backend services.
- Manager-only screens must use the existing manager guard. Backend authorization remains authoritative.

## Content and Course UX

- Admin forms start empty. Examples belong in placeholders, not in persisted default values.
- The course overview shows only the course, section, and unit hierarchy. Entry content is rendered only on the dedicated learning route.
- Course progression is sequential. The UI may explain locked state, but `exercise_service` is the source of truth for access and completion.
- Exercise answers are submitted to the server for evaluation. Never embed correct answers into learner-facing state or infer completion locally.
- Use the shared content/progress API modules and types rather than duplicating request logic in components.

## Implementation

- Prefer Server Components unless interactivity, browser APIs, or client-side auth state requires `"use client"`.
- Preserve loading, empty, error, and unauthorized states for data-driven pages.
- Reuse existing editor, renderer, layout, and API abstractions before introducing another parallel pattern.
- Keep media URLs renderable by the browser and show a useful fallback when media cannot load.

## Frontend Architecture

- Do not mix data fetching, state transitions, large JSX trees, and repeated Tailwind recipes in one file.
- Keep route `page.tsx` files thin. They should compose feature or layout components and contain only route-specific wiring.
- Put reusable visual primitives in `components/ui/`. Extend `Button`, form controls, cards, modals, editor actions, and ordering controls before adding another copy of their Tailwind classes.
- Structural Tailwind classes such as grids, gaps, and responsive layout may remain in feature views. Repeated control, card, action, focus, and state styles belong in shared UI primitives.
- Organize complex features in a directory with clear responsibilities:
  - `index.tsx` is the short component composer and public feature entry point.
  - `use-<feature>.ts` owns loading, saving, API calls, and state transitions.
  - `model.ts` owns pure factories, labels, transformations, and feature constants.
  - focused `*-form.tsx`, `*-preview.tsx`, and section components own presentation.
- Hooks and model modules must not render JSX. Presentational components receive state and callbacks through typed props and must not call backend APIs directly.
- Keep existing compatibility entry files such as `components/content/article-editor.tsx`; they re-export directory implementations so callers do not depend on internal file organization.
- Use `lib/utils/cn.ts` for conditional class composition and `lib/utils/collections.ts` for shared immutable list operations.
- Use `components/admin/admin-page.tsx`, `components/admin/admin-list.tsx`, and `lib/hooks/use-managed-list.ts` when building standard manager list screens.
- Prefer extending the existing feature pattern over introducing a new state library, styling system, or parallel component convention without a demonstrated need.

## Verification

Before handoff run:

```bash
npm run lint
npm run build
```

The build may require permission to spawn Next.js worker processes locally. Do not commit `.next/`, `node_modules/`, environment files, or secrets.
