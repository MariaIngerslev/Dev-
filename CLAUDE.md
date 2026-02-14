# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Start server:** `npm start` (runs `node src/main.js`, serves on http://localhost:3000)
- **Install dependencies:** `npm install`
- **Run tests:** `npm test` (Jest)
- **Security scan:** `python3 .claude/vibe-security-checker/scripts/scan_security.py . --full`

## Architecture

This is a Danish-language blog app with comment URL validation, built as an Express 5 SPA.

**Backend — Composition Root** (`src/main.js`): The application's Composition Root. Its sole responsibility is wiring: serving static files from `public/`, parsing JSON bodies, connecting to MongoDB via Mongoose, seeding initial data, and mounting route modules. No business logic, route handlers, or domain decisions should live here — all API logic belongs in `src/routes/`.

**Mongoose models** (`src/models/`):
- `Post.js` — Schema: `title` (String, required), `content` (String, required), `createdAt` (Date, default now).
- `Comment.js` — Schema: `name` (String, default: 'Anonym'), `content` (String, required), `postId` (ObjectId, ref: 'Post', required, indexed), `createdAt` (Date, default now).

**Shared utilities and middleware** (`src/utils/`, `src/middleware/`, `src/data/`):
- `utils/extractUrls.js` — Shared URL extraction via regex, used by both routes and client.
- `middleware/validateObjectId.js` — Reusable Express middleware for MongoDB ObjectId param validation.
- `data/seed.js` — Initial blog post seed content, separated from entry point.

**Route modules** (`src/routes/`):
- `api.js` — `POST /api/validate-urls`: delegates to the validator module, returns `{ allSafe, results }` where each result has `{ url, safe, reason }`.
- `posts.js` — `GET /api/posts`, `GET /api/posts/latest`, `GET /api/posts/:id`, `POST /api/posts`: blog post CRUD using the Post model. Uses `validateObjectId` middleware.
- `comments.js` — `POST /api/comments`, `GET /api/comments/:postId`: comments with URL safety checking, ObjectId validation via middleware, and post-existence validation (404 if post not found). Uses shared `extractUrls` utility.

**Frontend** (`public/`): Single-page app with History API-based client-side router (no framework). Two views toggled via `display: none/block`:
- `view-home` (`/`): Blog post list
- `view-post` (`/posts/:id`): Full post with comments and comment form

**`public/client.js`**: Implements a custom SPA router using `pushState`/`popstate` with pre-compiled route patterns. Global click delegation intercepts internal `<a>` tags. Uses DocumentFragment for batch DOM updates. Shared helpers: `el()` for DOM element creation, `formatDate()` for Danish locale dates, `extractExcerpt()` for post previews, `createBlogCard()` for home view cards. Handles comment form submission with `postId` from the current route, URL extraction via regex (`extractUrls`), and client-side URL safety checking via `POST /api/validate-urls`. A server-side catch-all route in `main.js` serves `index.html` for all non-API paths to support direct URL access and page refresh.

**Separation of Concerns in `client.js`:** Although all client code resides in a single file, maintain a strict logical separation between **Data Access** (all `fetch` calls and response handling) and **DOM Manipulation** (element creation, rendering, event binding). Keep data-fetching functions pure of DOM side-effects, and keep rendering functions free of network calls. This makes the code easier to reason about, test, and refactor.

**`src/urlvalidator.js`**: Mock URL validator with a Set-based domain blacklist (O(1) lookup) and random safe/unsafe simulation (`UNSAFE_THRESHOLD = 0.3`) for non-blacklisted URLs. Internal `classifyUrl` helper per URL; exports `validateUrls(urls)` returning `[{ url, safe, reason }]`. Hostname matching is case-insensitive.

## Express 5 Best Practices

- Uses Express 5 (not 4) — note API differences (e.g., `req.query` returns a getter, path-to-regexp v8).
- **Do not wrap route handlers in `try/catch` for standard error passing.** Express 5 natively handles rejected promises from `async` route handlers by forwarding the error to the error-handling middleware. Rely on this built-in behaviour to reduce boilerplate. Only use `try/catch` when you need to handle a specific error locally (e.g., returning a custom 404).
- Route handlers use `async/await`; let unhandled rejections propagate to Express's error pipeline.

## Coding Standards

- **Language:** UI-facing text is in Danish. All code, variable names, and comments are in English.
- **Security:** Prefer the `el()` helper for DOM element creation over `innerHTML` to prevent XSS. Never inject unsanitised user input into the DOM.
- **Clean Code — SRP:** Each function and module should have a single, well-defined responsibility. Extract logic into focused helpers rather than building large, multi-purpose functions.
- **Clean Code — Naming:** Use descriptive, intention-revealing names for variables, functions, and files. Avoid abbreviations and generic names like `data`, `temp`, or `result` when a more specific name is available.

## Key Context

- Uses CommonJS modules (`"type": "commonjs"` in package.json)
- MongoDB via Mongoose for data persistence; connection string from `MONGODB_URI` env var (falls back to `MONGO_URI`)
- `.env` file holds the connection string (git-ignored)
