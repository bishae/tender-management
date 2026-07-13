---
description: Conventions for maintaining changelogs across the monorepo
globs:
alwaysApply: true
---

# Changelog structure

Each independently deployable unit keeps its own changelog — don't maintain a single root
changelog that mixes unrelated apps/services:

```
apps/storefront/CHANGELOG.md
apps/admin/CHANGELOG.md
backend/CHANGELOG.md
packages/ui/CHANGELOG.md
packages/api-client/CHANGELOG.md
```

Only give a package its own `CHANGELOG.md` once it's actually versioned/published independently
(e.g. `packages/ui`, `packages/api-client`). Internal-only packages with no independent version
(e.g. `packages/config`) don't need one — note their changes in the changelog of whatever they
affect.

# Format: Keep a Changelog

All changelogs follow [Keep a Changelog](https://keepachangelog.com) formatting and
[Semantic Versioning](https://semver.org):

```md
# Changelog

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [1.4.0] - 2026-07-11

### Added
- Order refund flow in admin (#412)

### Fixed
- Cart total miscalculation when applying multiple discount codes (#408)
```

- Every entry is one line, written for a human reading release notes — not a copy of the commit
  message or PR title verbatim. State the user-visible effect, not the implementation detail
  ("Fixed checkout button being unclickable on Safari", not "fixed z-index bug in Checkout.tsx").
- Group entries under the correct category (`Added`/`Changed`/`Deprecated`/`Removed`/`Fixed`/
  `Security`). Don't invent new categories.
- Reference the PR or issue number in parentheses when known.
- Backend-only or internal refactors with zero user/consumer-facing effect do not need a changelog
  entry. If in doubt, ask: "would someone integrating against this app/package/API care?" — if
  yes, it gets an entry.

# When to update

- Every PR that changes behavior in a given app/package updates that unit's `[Unreleased]` section
  in the same PR — changelog entries are not a separate follow-up task.
- A PR touching both `apps/admin` and `backend` (e.g. a new endpoint + the admin UI for it) adds
  an entry to **both** changelogs, each describing the change from that unit's perspective:
  - `backend/CHANGELOG.md`: "Added `POST /v1/admin/refunds` endpoint"
  - `apps/admin/CHANGELOG.md`: "Added refund flow to order detail page"
- `packages/api-client` gets an entry whenever the generated client changes due to an OpenAPI
  spec update — this is what downstream consumers use to know they need to bump/regenerate.
- Breaking changes (removed/renamed fields, removed endpoints, removed component props) are always
  called out explicitly, ideally with a one-line migration note:
  ```md
  ### Changed
  - **Breaking:** `<Button variant="danger">` renamed to `variant="destructive"` to match new
    design tokens. Update usages accordingly.
  ```

# Releasing

- On release/version bump, rename `[Unreleased]` to the new version + date, then add a fresh empty
  `[Unreleased]` section above it. Don't leave `[Unreleased]` entries hanging around across
  multiple releases.
- Version numbers follow SemVer per unit: breaking change -> major, new backward-compatible
  functionality -> minor, fix/internal improvement -> patch. Frontend apps (storefront/admin) that
  deploy continuously rather than version-tagging can use the date instead of a version number
  under `[Unreleased]` at release time (e.g. `## [2026-07-11]`) — pick one convention per unit and
  stay consistent within it.
- If the repo uses Changesets (`.changeset/`) for `packages/*` versioning, changelog entries for
  those packages are generated from changeset files — add a changeset in the same PR
  (`pnpm changeset` or equivalent) instead of hand-editing that package's `CHANGELOG.md` directly.

# What not to do

- Don't batch-write changelog entries after the fact from git log — write them as part of the
  change, when the context of *why* is still available.
- Don't put internal implementation notes, TODOs, or discussion in the changelog — that belongs in
  the PR description or `docs/`.
- Don't skip an entry for a "small" fix that's still user-visible — changelog completeness matters
  more than brevity.
