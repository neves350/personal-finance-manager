# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../CLAUDE.md` for full project documentation including API, database, and monorepo commands.

## Web Commands

```bash
npm start                # Development server on http://localhost:4200
npm run build            # Production build
npm run watch            # Development build with watch
npm test                 # Run all Vitest tests
npm test -- <pattern>    # Run tests matching pattern (e.g., npm test -- auth)
```

## Angular 21 Coding Conventions

### Components

- Use standalone components (do NOT set `standalone: true` - it's the default in Angular 21)
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Use `input()` and `output()` functions instead of `@Input()` / `@Output()` decorators
- Use `computed()` for derived state
- Prefer inline templates for small components
- Use paths relative to the component TS file for external templates/styles
- Use `host` object in decorator instead of `@HostBinding` / `@HostListener`

### Templates

- Use native control flow: `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`, `*ngSwitch`)
- Use `class` bindings instead of `ngClass`
- Use `style` bindings instead of `ngStyle`
- Do not write arrow functions in templates (not supported)
- Use async pipe to handle observables

### State Management

- Use signals for component state
- Use `computed()` for derived state
- Use `update` or `set` on signals (not `mutate`)

### Services

- Use `providedIn: 'root'` for singleton services
- Use `inject()` function instead of constructor injection

### Forms

- Use Reactive forms (not Template-driven)

### Images

- Use `NgOptimizedImage` for static images (does not work for inline base64)

### Accessibility

- Must pass AXE checks
- Must follow WCAG AA: focus management, color contrast, ARIA attributes

## Project Structure

```
src/app/
├── core/
│   ├── api/           - HTTP API clients
│   ├── guards/        - Route guards (authGuard)
│   ├── services/      - State management (signals-based)
│   └── interceptors/  - HTTP interceptors
├── shared/            - Shared components, directives, pipes
├── pages/             - Routed page components (lazy loaded)
└── app.routes.ts      - Route configuration
```

## Key Patterns

- **HTTP:** All requests use `withCredentials: true` for cookie-based auth
- **Routing:** Use `loadComponent()` for lazy loading, `canActivate: [authGuard]` for protected routes
- **API Clients:** Located in `core/api/`, return observables
- **Toast Notifications:** Use ngx-sonner
- **Icons:** Use Lucide Icons
- **Styling:** TailwindCSS 4
