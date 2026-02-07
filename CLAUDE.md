# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Start server:** `npm start` (runs `node src/main.js`, serves on http://localhost:3000)
- **Install dependencies:** `npm install`
- **Run tests:** `npm test` (Jest)
- **Security scan:** `python3 .claude/vibe-security-checker/scripts/scan_security.py . --full`

## Architecture

This is a Danish-language blog app with comment URL validation, built as an Express 5 SPA.

**Backend** (`src/main.js`): Express server that serves static files from `public/`, parses JSON bodies, and exposes `POST /api/validate-urls` which delegates to the validator module.

**Frontend** (`public/`): Single-page app with client-side view switching (no router library). Two views are toggled via `display: none/block`:
- `view-home`: Blog post list
- `view-post`: Full post with comment form

**`public/client.js`**: Handles SPA navigation, comment form submission, URL extraction from comment text via regex (`extractUrls`), and calls `POST /api/validate-urls` to check found URLs. Displays green/red feedback based on results.

**`src/urlvalidator.js`**: Mock URL validator with a hardcoded domain blacklist and random safe/unsafe simulation for non-blacklisted URLs. Exports `validateUrls(urls)` returning `{ url, safe, reason }` per URL. Hostname matching is case-insensitive.

## Key context

- Uses CommonJS modules (`"type": "commonjs"` in package.json)
- Express 5 (not 4) — note API differences (e.g., `req.query` returns a getter, path-to-regexp v8)
- UI text is in Danish
