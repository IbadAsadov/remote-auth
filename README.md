# remote-auth

Handles everything auth-related: login, register (3 steps), forgot password. Runs on port 3001 as a standalone app and exposes its routes to the host shell at runtime via Module Federation.

---

## How it fits into the system

```
host-shell :3000
  /auth/* → remote-auth :3001  (this app)
             exposes: authApp/AuthRoutes
```

The host fetches `remoteEntry.js` from `:3001` at runtime and lazy-loads `AuthRoutes`. Internally that component renders login, register, and forgot-password pages — each as its own lazy chunk. The host has no idea any of this structure exists.

---

## Why a separate app for auth?

Auth changes independently from the dashboard. A bug fix or new validation rule shouldn't require redeploying all three apps. With this setup you redeploy only `remote-auth` and the host picks it up on the next page load without any coordination.

The other benefit is isolation — if something throws in auth (say a bad deploy), the `RemoteBoundary` in the host catches it and shows a recovery card. The dashboard keeps working.

I used Module Federation v2 (`@module-federation/enhanced`) over alternatives like `single-spa` because it works directly with Rspack, handles the shared React/Chakra singleton negotiation natively, and doesn't add a separate runtime layer.

---

## MF setup: what this app exposes

```ts
new ModuleFederationPlugin({
  name: "authApp",
  filename: "remoteEntry.js",
  exposes: {
    "./AuthRoutes": "./src/routes/AuthRoutes.tsx",
  },
});
```

One export. The host imports it as:

```tsx
const AuthRoutes = lazy(() => import("authApp/AuthRoutes"));
```

`AuthRoutes.tsx` itself lazy-loads each page (login, register, forgot-password) so you get per-page code splitting on top of the remote split. The `index.ts → import("./bootstrap")` pattern ensures shared modules like React are resolved by the MF runtime before any component code runs.

---

## Bundle strategy

```
vendor.forms.js  ← react-hook-form + zod (async, priority 30)
auth.shared.js   ← src/modules/shared used by 2+ modules (async, priority 20)
[page chunks]    ← login / register / forgot-password via React.lazy
```

`chunks: "async"` means these splits only apply to dynamically imported code. Form libs never load until a user reaches `/auth/*`. `auth.shared` deduplicates the shared form primitives so they don't get copied into both the login and register chunks.

---

## Forms and validation

This is where most of the front-end logic lives.

Stack is React Hook Form + Zod + `@hookform/resolvers/zod`. Schemas and TypeScript types are co-located in `src/types/auth.types.ts` and types are derived with `z.infer` — the schema is the single source of truth, there's no separate interface to keep in sync:

```ts
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;
```

Registration is a 3-step form. Each step has its own schema validated before advancing. The final submit validates the merged schema. Password confirmation uses `.superRefine()` for the cross-field check.

```
Step 1: name + date of birth (age ≥18 check)
Step 2: email, username (regex), password (strength rules), confirm password
Step 3: role (enum), newsletter checkbox, bio (optional, max 200 chars)
```

Field components live in `src/modules/shared/components/form/` — `FormInput`, `FormTextarea`, `FormSelect`, `FormCheckbox`. All generic over the form type so the `name` prop is constrained to actual field keys. They use `useFormContext` + `Controller` so the parent just wraps with `<FormProvider>` and children subscribe through context.

Validation mode is `onTouched`: shows error on blur, re-validates on change after that. Doesn't yell at you before you've finished typing.

---

## State

Zustand store (`useAuthStore`) with `user`, `isLoading`, `error` state and `login`, `register`, `logout`, `clearError` actions. The `useAuth` hook wraps it and adds a derived `isAuthenticated` boolean. Components import `useAuth()`, not the store directly.

All async actions are currently mocked with `setTimeout`. No real API calls yet.

---

## CSS and UI

Chakra UI v3 (CSS custom properties, no runtime injection). Design tokens in `src/theme/tokens.ts` — brand blue palette, neutral greys, semantic colours, Sora/Plus Jakarta Sans fonts. Component variants as Chakra recipes in `recipes.ts`. No `.css` files.

`AuthRoutes` wraps its entire tree with `AppThemeProvider`, so this remote brings its own Chakra theme when loaded by the host shell. The `cssVarsPrefix` is set to `"auth"` (emitting `--auth-*` CSS variables) so there is no collision with the host shell's `--mf-*` variables or `remote-dashboard`'s `--dashboard-*` variables. Changing tokens in `src/theme/tokens.ts` takes effect in both standalone dev mode and when running inside the host.

---

## Testing

Vitest + Testing Library. Store tests validate state transitions without mounting React — using Zustand's `getState()` directly. Hook tests mount `useAuth` in a minimal wrapper and assert on returned values. `test-utils/render.tsx` wraps Testing Library's `render` with providers.

```bash
bun run test
bun run test:coverage
```

---

## Risks

**All APIs are mocked.** `login` and `register` are `setTimeout` calls. Token expiry, 401 handling, network errors — none of that exists yet. When a real backend gets connected this will need to be properly built.

**Auth state is scoped here.** The host shell can't read `useAuthStore`. If you need to guard routes from the shell or let the dashboard react to logout, you'll need a cross-remote state channel or a lightweight shared module from the host.

**Multi-step form progress resets on reload.** The form state lives in RHF's in-memory state. Refresh mid-registration and you're back to step 1.

**No E2E tests.** Multi-step flow, redirect-after-login, validation messages — none of it is tested in a real browser.

---

## Strengths

Schema = TypeScript type via `z.infer`. Can't have a mismatch between runtime validation and static types.

Generic `FormInput<T>` means the `name` prop is type-checked against form field keys. Typos get caught at compile time.

Per-step Zod validation in the register flow gives immediate scoped error feedback without a full-form submit cycle.

`AuthRoutes` is path-prefix agnostic — the host can mount it at `/auth/*` or `/login/*` with no changes here.

---

## Weaknesses

All API calls are mocked. Zero real HTTP coverage.

Auth state isn't accessible outside this remote. Cross-remote state sharing isn't solved.

Theme token values are duplicated across all three apps. No sync mechanism — a shared design-token package would solve this.

No accessibility audit. The step indicator has no ARIA progressbar semantics.

---

## Project structure

```
src/
  index.ts                   ← async MF bootstrap
  bootstrap.tsx
  routes/
    AuthRoutes.tsx           ← the only MF export
  modules/
    login/components/
    register/components/
    forgot-password/components/
    shared/components/form/  ← FormInput, FormTextarea, FormSelect, FormCheckbox
  store/
    authStore.ts
    __tests__/
  hooks/
    useAuth.ts
    __tests__/
  types/
    auth.types.ts            ← Zod schemas + inferred types
  utils/
    toaster.tsx
  theme/
```

---

## Commands

```bash
bun run dev              # :3001
bun run build
bun run test
bun run test:coverage
bun run type-check
bun run check:fix
```

---

## 1. Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ navigates to /auth/*
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   host-shell  :3000                             │
│                                                                 │
│   BrowserRouter                                                 │
│   └── GlobalShell                                               │
│        └── /auth/*  ──► RemoteBoundary(name="Auth")            │
│                          └── lazy(() => authApp/AuthRoutes)     │
└────────────────────────────┬────────────────────────────────────┘
                             │ fetches remoteEntry.js
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   remote-auth  :3001                            │
│                                                                 │
│   Exposes: ./AuthRoutes → src/routes/AuthRoutes.tsx             │
│                                                                 │
│   AuthRoutes                                                    │
│   ├── /auth/login          → lazy(LoginPage)                    │
│   ├── /auth/register       → lazy(RegisterPage)                 │
│   └── /auth/forgot-password → lazy(ForgotPasswordPage)          │
│                                                                 │
│   State:  Zustand (useAuthStore)                                │
│   Forms:  React Hook Form + Zod schemas                         │
│   UI:     Chakra UI v3 (shared singleton from host)             │
└─────────────────────────────────────────────────────────────────┘

Shared singletons (negotiated at runtime via Module Federation):
react · react-dom · react-router-dom · @chakra-ui/react
@emotion/react · @emotion/styled · zustand
```

### Exposed contract

| Export name          | Source file                 |
| -------------------- | --------------------------- |
| `authApp/AuthRoutes` | `src/routes/AuthRoutes.tsx` |

---

## 2. Why Microfrontend?

| Concern                     | Monolith                                          | This MFE approach                                                   |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| **Team ownership**          | All teams share one deployment                    | Auth team owns its own repo, CI pipeline, and deploy cycle          |
| **Independent deployments** | Full rebuild on every change                      | Ship an auth fix without rebuilding or redeploying the dashboard    |
| **Bundle size**             | Auth code ships to every user regardless of route | Users on `/dashboard` never download auth code                      |
| **Technology flexibility**  | Locked to one global version                      | Auth remote can upgrade form libraries independently                |
| **Fault isolation**         | An auth crash can blank the entire app            | Host's `RemoteBoundary` scopes the failure to the `/auth/*` subtree |

**Module Federation v2** (`@module-federation/enhanced`) was chosen over `single-spa` or iframes because:

- Native Rspack/Webpack integration — no extra runtime adapters.
- Shared module negotiation prevents duplicate React instances (critical for hooks and context).
- `remoteEntry.js` manifest-based loading: no global variable pollution.

---

## 3. How Host and Remotes Work

### Bootstrap pattern

Every app has both `index.ts` and `bootstrap.tsx`. `index.ts` is a one-liner:

```ts
import("./bootstrap"); // dynamic import forces MF runtime to negotiate shared
// modules BEFORE any React component code executes
```

This guarantees that React, Router, and Chakra singletons are resolved before the component tree mounts, avoiding the "multiple React copies" / broken context issue.

### This remote as producer

`rspack.config.ts` registers the name and exposes one entry:

```ts
new ModuleFederationPlugin({
  name: "authApp",
  filename: "remoteEntry.js",
  exposes: {
    "./AuthRoutes": "./src/routes/AuthRoutes.tsx",
  },
});
```

### AuthRoutes — the exposed entry

`AuthRoutes.tsx` is path-prefix agnostic — it mounts internal `<Routes>` that are always relative to wherever the host places it (`/auth/*`). It lazy-loads each page as a separate chunk:

```tsx
const LoginPage = lazy(() => import("@modules/login/..."));
const RegisterPage = lazy(() => import("@modules/register/..."));
const ForgotPasswordPage = lazy(() => import("@modules/forgot-password/..."));
```

### Host consumption

The host shell wraps this remote in `RemoteBoundary`, which provides:

1. **`React.Suspense`** — shows a branded spinner while `remoteEntry.js` is being fetched.
2. **Class `RemoteErrorBoundary`** — catches `ChunkLoadError` and any other thrown errors, rendering a recovery card with **Retry** and **Go Home** buttons.

---

## 4. Bundle & Chunk Strategy

```
vendor.forms.js   ← react-hook-form + @hookform + zod (async, priority 30)
auth.shared.js    ← src/modules/shared used by ≥2 modules (async, priority 20)
[page chunks]     ← login / register / forgot-password via React.lazy
```

`chunks: "async"` means splitting only applies to dynamically-imported code — form library code is never pre-fetched until a user navigates to `/auth/*`.

Page-level splitting happens naturally because `AuthRoutes.tsx` itself uses `React.lazy()` for each page, creating a second level of dynamic-import splitting on top of the webpack `cacheGroups`.

The `auth.shared` cache group deduplicates code from `src/modules/shared` that is used by two or more modules, preventing the shared form primitives from being duplicated across the login and register page chunks.

---

## 5. Testing Strategy

### Tooling

| Tool                            | Purpose                        |
| ------------------------------- | ------------------------------ |
| **Vitest 3**                    | Test runner                    |
| **jsdom**                       | Browser environment simulation |
| **@testing-library/react**      | Component interaction testing  |
| **@testing-library/user-event** | Realistic event simulation     |
| **@testing-library/jest-dom**   | DOM assertion matchers         |

### Test types and location

```
src/
  store/__tests__/authStore.test.ts   ← unit: Zustand state transitions
  hooks/__tests__/useAuth.test.ts     ← unit: hook return values and actions
```

**Store tests** validate state transitions without mounting any React tree — using Zustand's `getState()` / `setState()` directly. Tests cover: initial state, loading flags during async actions, successful login/register setting user, and error paths populating the `error` field.

**Hook tests** mount `useAuth` in a minimal React wrapper and assert on derived values (`isAuthenticated`, `user`, error state) after action calls.

### Test utilities

`src/test-utils/render.tsx` wraps Testing Library's `render` with the Chakra theme provider and `MemoryRouter`, so every test imports `render` from `test-utils` instead of the library.

### Commands

```bash
bun run test              # single run
bun run test:watch        # watch mode
bun run test:coverage     # V8 coverage report
```

---

## 6. CSS & UI Architecture

### Chakra UI v3

Chakra v3 uses **CSS custom properties** instead of runtime style injection. All styles resolve to static CSS variables at initialisation — no overhead in production rendering.

### Design tokens (`src/theme/tokens.ts`)

```ts
colors:     brand (blue-based), neutral, success, warning, error, info
typography: Sora (headings), Plus Jakarta Sans (body), JetBrains Mono (mono)
fontSizes:  xs → 5xl scale
```

The token file is intentionally per-app (not shared). Each remote can diverge its visual identity without cross-app coupling.

### Recipes (`src/theme/recipes.ts`)

Component variants as **recipes** (tree-shaken in production):

| Recipe           | Adds                                                     |
| ---------------- | -------------------------------------------------------- |
| `buttonRecipe`   | `danger` colour variant + active scale micro-interaction |
| `cardSlotRecipe` | Standardised Card slot padding, border-radius, shadow    |

### Theme provider

The remote relies on the host shell's shared Chakra singleton negotiated by Module Federation — it does **not** mount a second `<ChakraProvider>`. `AppThemeProvider.tsx` is used only when running the remote standalone (development mode).

### No global CSS / CSS Modules

Layout, spacing, and colour all use Chakra's prop-based API (`px`, `py`, `bg`, `color`), mapped to design tokens. There are no `.css` files or CSS Modules.

---

## 7. Form & Validation Approach

### Stack

| Layer                   | Library                     |
| ----------------------- | --------------------------- |
| Form state & submission | **React Hook Form 7**       |
| Schema definition       | **Zod 4**                   |
| Schema–RHF bridge       | **@hookform/resolvers/zod** |

### Single source of truth

Zod schemas and TypeScript types are co-located in `src/types/auth.types.ts`. `z.infer<typeof schema>` derives the TypeScript type — schema and type can never drift apart:

```ts
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;
```

### Multi-step registration form

Three per-step schemas validated independently as the user progresses; a merged schema validates the final payload on submit:

```
Step 1 ──▶ Step 2 ──▶ Step 3 ──▶ Submit
  name, dob    email,          role enum,
  age ≥18      username regex, newsletter,
               password        bio (optional)
               strength,
               confirmPassword
               (superRefine)
```

Password confirmation uses Zod's `.superRefine()` for cross-field validation.

A `StepIndicator` component renders animated progress with a pulsing ring on the current step.

### Controlled field primitives

`src/modules/shared/components/form/` exports generic typed components:

| Component         | Wraps                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| `FormInput<T>`    | Chakra `Input` + `Field.Root` with optional right-element slot          |
| `FormTextarea<T>` | Chakra `Textarea` with optional character counter (warns at 90% of max) |
| `FormSelect<T>`   | Chakra `NativeSelect`                                                   |
| `FormCheckbox<T>` | Chakra `Checkbox` with optional description                             |

All use `useFormContext<T>()` + `Controller` — the parent form provides `<FormProvider {...methods}>` context, no prop drilling required.

### Validation mode

`mode: "onTouched"` — validates on `blur` for the first interaction, then on `change` once a field has been touched. Balances immediate feedback with not prematurely flagging untouched fields.

---

## 8. Risks as the Project Scales

1. **Shared module version drift** — if `react-hook-form` or `zod` versions diverge from the host's declared range, the MF singleton mechanism will use one version at runtime, potentially breaking whichever remote was built against the other. _Mitigation_: pin versions via a root workspace manifest or Renovate bot.

2. **Mocked API surface** — all `login`, `register`, and `logout` calls simulate a network round-trip with `setTimeout`. Token refresh, 401 handling, and network timeouts have zero coverage. _Mitigation_: introduce an `apiClient` abstraction for interceptors and a real backend endpoint.

3. **Auth state not shared with host** — the host shell has no access to `useAuthStore`. If the host needs to guard routes (`/dashboard` redirect to `/auth/login` after logout), it must re-implement auth state or add a cross-remote state channel. _Mitigation_: expose a lightweight auth state module from this remote, or move the shared state to the host.

4. **Multi-step form state is local** — step data lives in React Hook Form's `useForm` local state. A page refresh mid-registration loses all progress. _Mitigation_: persist step data to `sessionStorage` or URL search params.

5. **No E2E coverage** — multi-step register, form validation messages, and redirect-after-login flows are untested at the browser level. _Mitigation_: add Playwright tests covering the critical auth paths.

6. **StepIndicator has no keyboard navigation** — the step indicator is visual-only with no ARIA roles for progress indication. _Mitigation_: add `role="progressbar"`, `aria-valuenow`, and `aria-label` attributes.

---

## 9. Strengths

- **Schema = Type** — Zod schemas derive TypeScript types via `z.infer`, eliminating the class of bug where a schema is updated but its interface type is not (or vice versa).
- **Generic form primitives** — `FormInput<T>` / `FormTextarea<T>` are fully type-safe via TypeScript generics; `name` props are constrained to actual form field keys, catching misspellings at compile time.
- **Multi-step validation isolation** — each step's Zod schema validates independently, giving the user immediate, scoped error feedback without needing to submit the full form.
- **Path-prefix agnostic routing** — `AuthRoutes` mounts relative `<Routes>` and can be placed at any prefix in the host shell without any internal changes.
- **Bootstrap async boundary** — the `index.ts → import("./bootstrap")` pattern is correctly implemented, preventing stale shared-module registration on module load.
- **Shared form component library** — `src/modules/shared/components/form/` is available to all modules within this remote, meaning new auth flows (e.g., 2FA) can be built quickly without re-implementing field wiring or error display.

---

## 10. Weaknesses

- **All APIs are mocked** — `setTimeout` stubs give no coverage of real HTTP paths, authentication token expiry, refresh token flows, or server-side validation errors.
- **Auth state is not accessible to the host** — the shell cannot react to logout events or enforce auth guards without re-implementing state logic.
- **No E2E tests** — multi-step registration, redirect-after-login, and form validation paths are untested end-to-end in a real browser.
- **Multi-step progress is lost on page refresh** — form data lives only in React Hook Form's in-memory state; a hard refresh resets the user to Step 1.
- **Duplicated theme configuration** — `tokens.ts`, `recipes.ts`, and `AppThemeProvider.tsx` are copy-pasted from `host-shell`. A brand update requires changes in every app with no enforcement mechanism.
- **No accessibility audit** — `StepIndicator` lacks ARIA progressbar semantics; no screen-reader testing has been performed on the multi-step form.

---

## Project Structure

```
src/
  index.ts                   ← async MF bootstrap boundary
  bootstrap.tsx              ← React root mount
  routes/
    AuthRoutes.tsx           ← exposed MF entry — lazy-loads each page
  modules/
    login/components/        ← LoginPage, LoginForm
    register/components/     ← RegisterPage, multi-step form steps
    forgot-password/components/
    shared/components/
      form/                  ← FormInput, FormTextarea, FormSelect, FormCheckbox
      StepIndicator.tsx      ← multi-step progress UI
  store/
    authStore.ts             ← Zustand store
    __tests__/authStore.test.ts
  hooks/
    useAuth.ts               ← store facade + isAuthenticated derived value
    __tests__/useAuth.test.ts
  types/
    auth.types.ts            ← Zod schemas + z.infer TypeScript types
  utils/
    toaster.tsx              ← Chakra toaster instance
  theme/
    tokens.ts · recipes.ts · AppThemeProvider.tsx
```

---

## Commands

```bash
bun run dev              # dev server on :3001
bun run build            # production build → dist/
bun run test             # vitest single run
bun run test:watch       # vitest watch mode
bun run test:coverage    # coverage report (V8)
bun run type-check       # tsc --noEmit
bun run check:fix        # biome lint + format (write)
```
